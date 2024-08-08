import { useState, useEffect } from 'react';
import {
  EVENTS,
  Playback,
  STATUS_LIST,
  User,
  UserCreateModel,
  MessageResponse,
  WssEvent,
  UserChatMsg,
  VoteUser,
  VOTES_TYPES,
} from '../../typing/shared';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import UserForm from 'components/UserForm';
import JoiningUsers from 'components/JoiningUsers';
import YoutubePlayer from 'components/YoutubePlayer';
import FooterPlayer from 'components/FooterPlayer';
import UserList from 'components/UserList';
import { Card } from 'components/Ui/Card';
import useWebsockets from './hooks/useWebsockets';
import usePlayer from './hooks/usePlayer';
import useListHandlers from './hooks/useListHandlers';
import { ROUTES } from 'utils/routes';
import {
  NOTIFICATIONS_MSG,
  VIDEO_STATUS,
  VIDEO_STATUS_TO_STATUS_LIST,
} from 'utils/constants';
import { useSnackbar } from 'notistack';
import ChannelChat from 'components/ChannelChat';
import { calculateVotePercentages } from 'utils/utils';

export default function VideoList() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [usersData, setUsersData] = useState<User[] | null>(null);
  const [playbackData, setPlaybackData] = useState<Playback | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [chatMessages, setChatMessages] = useState<UserChatMsg[]>([]);
  const [userVotes, setUserVotes] = useState<VoteUser[]>([]);
  const [sendingVote, setSendingVote] = useState(false);
  const [repeatVideo, setRepeatVideo] = useState(false);

  const { id } = useParams();

  const listId = id;
  const hostUser = usersData?.find((u) => u.host);
  const isHost = username !== null && hostUser?.username === username;

  const videoUrl = playbackData?.url ? playbackData?.url : null;

  const { list, isPending, handleUpdateList } = useListHandlers({ listId });

  function onStartPlaying() {
    if (isHost) {
      handleUpdateList({
        status: VIDEO_STATUS_TO_STATUS_LIST[VIDEO_STATUS.PLAYING],
      });
    }
    setVideoStarted(true);
  }

  function onVideoEnd() {
    if (repeatVideo) {
      handleRepeatVideo();
      return;
    }

    if (isHost) {
      const user = usersData?.find((u) => u.username === username);

      if (!user) return;

      sendMessage(EVENTS.NEXT_VIDEO, { user });
    }
  }

  const {
    videoData,
    onPlayerReady,
    onPlayerStateChange,
    onPlay,
    onPlayerError,
    handleVolumePlayer,
    updatePlayerTime,
    volume,
    handleRepeatVideo,
  } = usePlayer({ onStartPlaying, onVideoEnd });

  const { title, subject } = list || {};

  function removeUserFromList() {
    sendMessage(EVENTS.REMOVE_USER, { username });
  }

  const { connectionStatus, sendMessage, webSocketReady } = useWebsockets({
    listId,
    onMessageReceive: handleMessageReceived,
    enabled: Boolean(listId && list),
  });

  // if user closes the browser
  function handleUnload() {
    removeUserFromList();
  }

  // if user join and playlist has been already started
  useEffect(() => {
    if (
      list &&
      list.status === STATUS_LIST.PLAYING &&
      videoStarted &&
      playbackData
    ) {
      const seconds =
        (new Date().getTime() - new Date(playbackData.started_time).getTime()) /
        1000;

      if (seconds > 10) {
        updatePlayerTime(Math.round(seconds));
      }
    }
  }, [list, videoStarted, playbackData]);

  useEffect(() => {
    if (username) {
      window.addEventListener('unload', handleUnload);
    }
    return () => {
      window.removeEventListener('unload', handleUnload);
      if (username) {
        handleUnload();
      }
    };
  }, [username]);

  useEffect(() => {
    function handleVotingActions() {
      const { nextPercentage, repeatPercentage } = calculateVotePercentages(
        userVotes,
        usersData?.length || 0
      );

      const repeatPercentageNumber = parseInt(repeatPercentage);
      const nextPercentageNumber = parseInt(nextPercentage);

      if (nextPercentageNumber > 50 && isHost) {
        const user = usersData?.find((u) => u.username === username);

        if (!user) return;

        sendMessage(EVENTS.NEXT_VIDEO, { user });
      }

      if (repeatPercentageNumber > 50) {
        setRepeatVideo(true);
        return;
      }
      setRepeatVideo(false);
    }

    if (userVotes?.length && usersData?.length) {
      handleVotingActions();
    }
  }, [userVotes, usersData]);

  function handleMessageReceived(msg: WssEvent<MessageResponse>) {
    const { payload, type: event } = msg;

    console.log('msg: ', msg);

    handleNotifications(event, payload);

    if (payload?.chatMsg && payload.listId === listId) {
      setChatMessages((currentMsgs) => {
        return currentMsgs.concat(payload?.chatMsg as unknown as UserChatMsg);
      });
    }

    if (payload?.votes) {
      handleVoteResults(payload?.votes);
    }

    if (payload.users) {
      setUsersData(payload?.users);
    }

    if (payload.playback) {
      setPlaybackData(payload?.playback);
    }
  }

  function onSubmitNewUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const usernameInForm = formData.get('username') as string;
    const url = formData.get('url') as string;

    const youtubeUrlRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

    if (!usernameInForm || !url) {
      alert('You need to complete the form to proceed.');
      return;
    }

    if (!youtubeUrlRegex.test(url)) {
      alert('You need to insert a url form youtube site.');
      return;
    }

    if (username === null && webSocketReady) {
      const addUser: UserCreateModel = {
        username: usernameInForm,
        url,
      };

      const usernameExists =
        usersData?.findIndex((u) => u.username === usernameInForm) !== -1;

      if (usernameExists) {
        alert('Username already exists. Choose another username.');
        return;
      }

      sendMessage(EVENTS.ADD_USER, addUser);

      setUsername(usernameInForm);
    }
  }

  function handleOnStart() {
    const user = usersData?.find((u) => u.username === username);

    if (!user) return;

    user.status = 'PENDING';

    sendMessage(EVENTS.START_PLAYLIST, { user });
  }

  function handlePlaylistEnded(reason: string | undefined) {
    handleUpdateList({
      status: VIDEO_STATUS_TO_STATUS_LIST[VIDEO_STATUS.ENDED],
    });

    enqueueSnackbar(`${NOTIFICATIONS_MSG.PLAYLIST_ENDED}: ${reason}`, {
      variant: 'info',
    });
    const endPath = generatePath(ROUTES.LIST_ENDED, { id: listId });

    navigate(endPath);
  }

  function handleNotifications(event: string, payload: MessageResponse) {
    switch (event) {
      case EVENTS.PLAYLIST_ENDED:
        return handlePlaylistEnded(payload?.reason);

      case EVENTS.PLAYLIST_STARTED:
        enqueueSnackbar(NOTIFICATIONS_MSG.PLAYLIST_STARTED, {
          variant: 'success',
        });
        break;
      case EVENTS.USER_ADDED:
        enqueueSnackbar(NOTIFICATIONS_MSG.USER_ADDED, { variant: 'success' });
        break;
      case EVENTS.USER_REMOVED:
        enqueueSnackbar(NOTIFICATIONS_MSG.USER_REMOVED, { variant: 'warning' });
        break;
      case EVENTS.USER_OF_PLAYBACK_LOGOUT:
        enqueueSnackbar(NOTIFICATIONS_MSG.USER_OF_PLAYBACK_LOGOUT, {
          variant: 'error',
        });
        break;
      default:
        break;
    }
  }

  function onSubmitChatMsg(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const message = formData.get('message') as string;

    if (!message.length) {
      alert('Message can not be empty!');
      return;
    }

    sendMessage(EVENTS.SEND_CHAT_MSG, {
      message,
      username,
    });
  }

  function handleVoteResults(votes: VoteUser[]) {
    setUserVotes(votes);
    setSendingVote(false);
  }

  function handleUserVote(vote: VOTES_TYPES) {
    setSendingVote(true);
    sendMessage(EVENTS.ADD_VOTE, { username, vote });
  }

  return (
    <div className="h-screen">
      {isPending ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex p-2 flex-col justify-center items-center">
            {title && <h2 className="text-2xl text primary">{title}</h2>}
            {subject && <h3 className="text-xl text primary">{subject}</h3>}
          </div>

          {!usersData?.length ||
          hostUser?.status === STATUS_LIST.NOT_STARTED ||
          !username ? (
            <div className="container  flex jusify-center items-center flex-col gap-6">
              {!username ? (
                <UserForm onSubmit={onSubmitNewUser} />
              ) : (
                <JoiningUsers
                  users={usersData || []}
                  username={username || ''}
                  handleOnStart={handleOnStart}
                  isHost={isHost}
                />
              )}
            </div>
          ) : (
            <>
              {videoUrl ? (
                <>
                  <YoutubePlayer
                    videoUrl={videoUrl}
                    onPlayerError={onPlayerError}
                    onPlayerReady={onPlayerReady}
                    onPlayerStateChange={onPlayerStateChange}
                    onPlay={onPlay}
                  />
                  <FooterPlayer
                    handleVolumePlayer={handleVolumePlayer}
                    videoTitle={(videoData?.title as string) || ''}
                    author={(videoData?.author as string) || ''}
                    duration={videoData?.duration as number}
                    handleUserVote={handleUserVote}
                    sendingVote={sendingVote}
                    userVotes={userVotes}
                    volume={volume}
                    totalUsers={usersData?.length || 0}
                    username={username}
                  />
                  <div className="flex">
                    <Card className="w-1/2 mt-4 ml-4">
                      <ChannelChat
                        chatMessages={chatMessages}
                        onSubmitChatMsg={onSubmitChatMsg}
                      />
                    </Card>
                    <Card className="w-1/2 mt-4 mr-4">
                      <UserList
                        users={usersData || []}
                        username={username || ''}
                      />
                    </Card>
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-center w-full">
                  <p className="text-center text-2xl">Loading player....</p>
                </div>
              )}
            </>
          )}
          <div className="p-4">
            Channel status: <b>{connectionStatus}</b>
          </div>
        </>
      )}
    </div>
  );
}
