import {
  InitPlaybackModel,
  PlaybackModel,
  UpdatePlaybackModel,
} from '../../models/playback.models';
import { updatePlaylist } from '../../models/playlist.models';
import {
  UserChatMsg,
  UserModel,
  UserPayloadModel,
  UserRemoveModel,
  UserUpdateModel,
} from '../../models/user.models';
import { VOTES_TYPES, VotesModel } from '../../models/votes.models';
import { EVENTS } from '../../utils/events.utils';
import { PlaybackService } from './playback.service';
import { UsersService } from './users.service';
import { VotesService } from './votes.service';
import { WssService } from './wss.services';

export class Playlist {
  constructor(
    private readonly userService = new UsersService(),
    private readonly playbackService = new PlaybackService(),
    private readonly votesService = new VotesService()
  ) {}

  public getPlaylist(listId: string) {
    const availableUsers = this.userService.getUsersOfList(listId);

    const currentPlayback = this.playbackService.getPlaybackById(listId);

    const currentVotes = this.votesService.getListVotes(listId);

    return {
      users: availableUsers,
      playback: currentPlayback,
      votes: currentVotes,
    };
  }

  public onConnection(listId: string) {
    const playlist = this.getPlaylist(listId);

    WssService.instance.sendMessage(EVENTS.INIT_PLAYLIST, playlist, listId);
  }

  public startPlaylist(listId: string, payload: updatePlaylist) {
    if (!payload?.user?.host) {
      WssService.instance.sendMessage(
        EVENTS.ERROR,
        {
          message: 'Playlist only can be started by host',
          username: payload?.user?.username,
        },
        listId
      );
      return;
    }

    const { result: users } = this.userService.startPlaylist(listId);

    if (!users) return;

    const { result: playback, error } = this.playbackService.initPlayback(
      listId,
      { url: users[0].url }
    );

    if (error || !playback?.url) {
      WssService.instance.sendMessage(
        EVENTS.ERROR,
        {
          message: !playback?.url ? 'playback do not exists' : error,
        },
        listId
      );
      return;
    }

    console.log(`Starting playlist...`);

    WssService.instance.sendMessage(
      EVENTS.PLAYLIST_STARTED,
      {
        users,
        playback,
      },
      listId
    );
  }

  public endPlaylist(listId: string, reason?: string) {
    console.log('Reason of ending: ', reason);
    this.userService.removeUsersList(listId);
    this.playbackService.removePlayback(listId);
    this.votesService.removeVotesList(listId);
    WssService.instance.sendMessage(EVENTS.PLAYLIST_ENDED, { reason }, listId);
  }

  public addUserToPlaylist(listId: string, payload: UserPayloadModel) {
    const { result: newUserList, error } = this.userService.addUserInList(
      listId,
      payload
    );

    if (error) {
      console.error(error);
      WssService.instance.sendMessage(
        EVENTS.ERROR,
        {
          message: error,
          username: payload?.username,
        },
        listId
      );
      return;
    }

    WssService.instance.sendMessage(
      EVENTS.USER_ADDED,
      {
        users: newUserList,
      },
      listId
    );
  }

  public updateUser(listId: string, payload: UserModel) {
    let users: UserModel[] | null = null;

    const { result, error } = this.userService.updateUser(
      listId,
      payload as UserUpdateModel
    );

    if (error || !result) {
      WssService.instance.sendMessage(
        'error',
        {
          username: payload?.username,
          message: error,
        },
        listId
      );
      return;
    }

    users = result;
    return users;
  }

  private userUrlIsInPlayback(listId: string, user: UserModel): boolean {
    const playback = this.playbackService.getPlaybackById(listId);

    console.log(
      `checking if user url ${user.url} is equal to playback ${playback?.url} ---> `,
      this.userService.getUsersOfList(listId)
    );

    return user.url === playback?.url;
  }

  private removeUserInPlayback(listId: string, user: UserModel) {
    // get the user list
    const userList = this.userService.getUsersOfList(listId);

    // check if user to be removed is the last
    const indexToRemove = userList.indexOf(user);
    const isLastIndex = indexToRemove === userList.length - 1;

    console.log('indexToRemove: ', indexToRemove);
    console.log('last index: ', userList.length - 1);

    // if true => end list event
    if (isLastIndex) {
      console.log(`User ${user.username} is last user: ENDING the playlist...`);

      this.endPlaylist(
        listId,
        'Last user video was playing, but he logged out.'
      );

      return;
    }

    // if false => update playback with next user
    const { error: removedError, result: newUsers } =
      this.userService.removeUser(listId, { username: user.username });

    if (removedError || !newUsers) {
      console.error(removedError);
      WssService.instance.sendMessage(
        'error',
        {
          message: removedError,
        },
        listId
      );
      return;
    }

    const newVotes = this.votesService.removeUserVote(listId, user.username);

    const newUrl = newUsers[indexToRemove].url;

    const { error, result: playback } = this.playbackService.nextVideo(listId, {
      url: newUrl,
    });

    if (error) {
      console.error(error);
      WssService.instance.sendMessage(
        'error',
        {
          message: removedError,
        },
        listId
      );
      return;
    }
    console.log(
      `Updating playlist with url ${newUrl} of user ${newUsers[indexToRemove].username}`
    );
    WssService.instance.sendMessage(
      EVENTS.USER_OF_PLAYBACK_LOGOUT,
      {
        users: newUsers,
        playback,
        votes: newVotes,
      },
      listId
    );

    return;
  }

  public removeUser(listId: string, payload: UserRemoveModel) {
    console.log('removin user: ', payload?.username);
    // get user
    const { error: getError, result: user } =
      this.userService.getUserByUsername(listId, payload.username);

    if (getError || !user) {
      console.error(getError);
      WssService.instance.sendMessage(
        'error',
        {
          message: getError,
        },
        listId
      );
      return;
    }

    // check if user is host
    if (user.host) {
      console.log(`HOST user ${user.username} logging out...`);

      return this.endPlaylist(listId, 'Host user logged out');
    }

    // check if user url is in the playback
    const userUrlIsInPlayback = this.userUrlIsInPlayback(listId, user);

    if (userUrlIsInPlayback) {
      console.log(`Removing user ${user.username} in playback...`);
      return this.removeUserInPlayback(listId, user);
    }

    // otherwise remove user
    const { error, result } = this.userService.removeUser(listId, payload);

    if (error) {
      console.error(error);
      WssService.instance.sendMessage(
        'error',
        {
          message: error,
        },
        listId
      );
      return;
    }

    const newVotes = this.votesService.removeUserVote(listId, payload.username);

    // if no users are left, end playlist
    if (!result?.length) {
      return this.endPlaylist(listId, 'All users looged out');
    }

    console.log(`Removing user ${user.username}...`);

    WssService.instance.sendMessage(
      EVENTS.USER_REMOVED,
      {
        listId,
        users: result,
        votes: newVotes,
      },
      listId
    );
  }

  public updatePlayback(listId: string, payload: updatePlaylist) {
    if (!payload?.user?.host) {
      WssService.instance.sendMessage(
        EVENTS.ERROR,
        {
          message: 'Playlist only can be updated by host',
          username: payload?.user?.username,
        },
        listId
      );
      return;
    }

    let playback: PlaybackModel | null = null;

    console.log(`Playlist getting next video...`);

    // get user index of current playback
    const nextVideoUrl = this.getNextVideoUrl(listId);

    console.log('nextVideoUrl: ', nextVideoUrl);

    if (!nextVideoUrl) {
      return this.endPlaylist(
        listId,
        'There are no more videos. Playlist has ended'
      );
    }

    const { result, error } = this.playbackService.nextVideo(listId, {
      url: nextVideoUrl,
    });

    if (error || !result) {
      WssService.instance.sendMessage(
        'error',
        {
          message: error,
        },
        listId
      );
      return;
    }

    playback = result;

    const resetedVotes = this.votesService.cleanVotesOfList(listId);

    WssService.instance.sendMessage(
      EVENTS.UPDATE_PLAYLIST,
      {
        playback,
        votes: resetedVotes,
      },
      listId
    );
  }

  private getNextVideoUrl(listId: string): null | string {
    const userList = this.userService.getUsersOfList(listId);

    const currentPlayback = this.playbackService.getPlaybackById(listId);

    const currIndex = userList.findIndex(
      (user) => user.url === currentPlayback?.url
    );

    console.log('currIndex: ', currIndex, 'userList: ', userList);

    if (currIndex === -1) {
      return null;
    }

    if (currIndex + 1 > userList.length - 1) {
      return null;
    }

    return userList[currIndex + 1].url;
  }

  public onUserChatMessage(listId: string, payload: UserChatMsg) {
    WssService.instance.sendMessage(
      EVENTS.RESEND_CHAT_MSG,
      {
        listId,
        chatMsg: payload,
      },
      listId
    );
  }

  public onAddVote(listId: string, payload: VotesModel) {
    const { result, error } = this.userService.getUserByUsername(
      listId,
      payload.username
    );

    const list = this.playbackService.getPlaybackById(listId);

    if (!list) {
      WssService.instance.sendMessage(
        EVENTS.ERROR,
        {
          message: 'Playlist must start if you want to vote',
          username: payload?.username,
        },
        listId
      );
      return;
    }

    if (error || !result) {
      WssService.instance.sendMessage(
        EVENTS.ERROR,
        {
          message: 'You must be logged in to vote',
          username: payload?.username,
        },
        listId
      );
      return;
    }

    const votes = this.votesService.voteInList(listId, payload);

    return WssService.instance.sendMessage(
      EVENTS.UPDATED_VOTING_RESULTS,
      {
        votes,
      },
      listId
    );
  }

  public onMessage(listId: string, msg: Record<string, unknown>) {
    console.log('');
    console.log('event: ', msg.event);
    if (msg.event === EVENTS.START_PLAYLIST) {
      this.startPlaylist(listId, msg.data as updatePlaylist);
    }

    if (msg.event === EVENTS.GET_PLAYLIST) {
      this.getPlaylist(listId);
      return;
    }

    if (msg.event === EVENTS.ADD_USER) {
      this.addUserToPlaylist(listId, msg.data as UserPayloadModel);
    }

    if (msg.event === EVENTS.REMOVE_USER) {
      this.removeUser(listId, msg.data as UserRemoveModel);
    }

    if (msg.event === EVENTS.NEXT_VIDEO) {
      this.updatePlayback(listId, msg.data as updatePlaylist);
    }

    if (msg.event === EVENTS.UPDATE_USER) {
      this.updateUser(listId, msg.data as UserModel);
    }

    if (msg.event === EVENTS.SEND_CHAT_MSG) {
      this.onUserChatMessage(listId, msg.data as UserChatMsg);
    }

    if (msg.event === EVENTS.ADD_VOTE) {
      this.onAddVote(listId, msg.data as VotesModel);
    }
  }
}
