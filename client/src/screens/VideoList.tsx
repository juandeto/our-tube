import { useState, useEffect, useRef } from 'react';
import {
  EVENTS,
  EVENTS_TYPE,
  STATUS_LIST,
  User,
  UserCreateModel,
  UsersResponse,
  WssEvent,
} from '../typing/shared';
import { useParams } from 'react-router-dom';
import UserForm from 'components/UserForm';
import JoiningUsers from 'components/JoiningUsers';
import YoutubePlayer from 'components/YoutubePlayer';
import { YouTubePlayer, YouTubeEvent, YouTubeProps } from 'react-youtube';
import FooterPlayer from 'components/FooterPlayer';
import UserList from 'components/UserList';
import { Card } from 'components/Ui/Card';
import ENV from 'utils/constants';

const WS_URL = ENV.WS_API_URL;

enum ReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
  UNINSTANTIATED,
}

const VIDEO_STATUS = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  VIDEO_CUED: 5,
} as const;

export default function VideoList() {
  const [username, setUsername] = useState<string | null>(null);
  const [usersData, setUsersData] = useState<User[] | null>(null);
  const [webSocketReady, setWebSocketReady] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoData, setVideoData] = useState<Record<string, string>>({});

  const player = useRef<YouTubePlayer | null>(null);

  const videoUrl = usersData?.[currentVideoIndex].url || '';

  const { id } = useParams();

  const listId = id || '';

  const webSocket = useRef<WebSocket | null>(null);

  const hostUser = usersData?.find((u) => u.host);

  const isHost = username !== null && hostUser?.username === username;

  function sendMessage<T>(event: EVENTS_TYPE, data: T) {
    webSocket?.current?.send(
      JSON.stringify({
        event,
        data,
      })
    );
  }

  function removeUserFromList() {
    sendMessage(EVENTS.REMOVE_USER, { username });
  }

  useEffect(() => {
    const connectWebSocket = () => {
      if (webSocket.current) return;
      console.log('run connectWebSocket');

      webSocket.current = new WebSocket(WS_URL + '?listId=' + listId);

      webSocket.current.onopen = () => {
        console.log('open');
        setWebSocketReady(true);
      };

      webSocket.current.onmessage = function (event) {
        try {
          const msg = JSON.parse(event.data);

          console.log('msg 1: ', msg);
          onMessageReceive(msg);
        } catch (error) {
          console.error('Error parsing message', error);
        }
      };

      webSocket.current.onclose = function () {
        console.log('closing');
        setWebSocketReady(false);
      };

      webSocket.current.onerror = function (err: Event) {
        console.log('Socket encountered error: ', err, 'Closing socket');
        setWebSocketReady(false);

        if (webSocket.current && webSocket.current.readyState === 1) {
          webSocket.current.close(1000, 'closing');
        }
      };
    };

    connectWebSocket();
  }, [listId, username]);

  function handleUnload() {
    removeUserFromList();
  }

  useEffect(() => {
    window.addEventListener('unload', handleUnload);
    return () => {
      if (username) {
        window.removeEventListener('unload', handleUnload);
      }
    };
  }, [username]);

  function onMessageReceive(msg: WssEvent<UsersResponse>) {
    console.log('msg: ', msg.payload?.users);
    switch (msg.type) {
      case EVENTS.USER_ADDED:
        setUsersData(msg.payload?.users as User[]);
        break;
      case EVENTS.USER_REMOVED:
        setUsersData(msg.payload?.users as User[]);
        break;
      case EVENTS.PLAYLIST_STARTED:
        setUsersData(msg.payload?.users as User[]);
        break;
      case EVENTS.UPDATE_USER:
        setUsersData(msg.payload?.users as User[]);
        break;
      default:
        break;
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

      sendMessage(EVENTS.ADD_USER, addUser);

      setUsername(usernameInForm);
    }
  }

  function handleOnStart() {
    const user = usersData?.find((u) => u.username === username);

    if (!user) return;

    user.status = 'PENDING';

    sendMessage(EVENTS.START_PLAYLIST, { listId });
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[webSocket?.current?.readyState || 4];

  function onPlayerReady(event: YouTubeEvent) {
    // store the player instance
    player.current = event?.target;

    const videoData = player.current.getVideoData();

    setVideoData(videoData);
  }

  function onPlayerStateChange(event: YouTubeEvent) {
    console.log('event state change: ', event);

    if (VIDEO_STATUS.ENDED === event.data) {
      if (usersData?.length && currentVideoIndex === usersData?.length - 1) {
        // playlist ended
        return;
      }

      setCurrentVideoIndex((curr) => curr + 1);
    }
  }

  function onPlay(event: YouTubeEvent) {
    console.log('PLAYING');
  }

  function onPlayerError(event: YouTubeEvent) {}

  function handleVolumePlayer(e: string) {
    player.current.setVolume(Number(e));
  }

  return (
    <div className="h-screen">
      {!usersData?.length || hostUser?.status === STATUS_LIST.NOT_STARTED ? (
        !usersData?.length ? (
          <UserForm onSubmit={onSubmitNewUser} />
        ) : (
          <JoiningUsers
            users={usersData}
            username={username || ''}
            handleOnStart={handleOnStart}
            isHost={isHost}
          />
        )
      ) : (
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
            videoTitle={videoData?.title || ''}
            author={videoData?.author || ''}
          />
          <Card className="w-1/2 mt-4 ml-4">
            <UserList users={usersData || []} username={username || ''} />
          </Card>
        </>
      )}
      <div className="p-4">
        Channel status: <b>{connectionStatus}</b>
      </div>
    </div>
  );
}
