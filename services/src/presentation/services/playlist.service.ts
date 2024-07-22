import {
  InitPlaybackModel,
  PlaybackModel,
  UpdatePlaybackModel,
} from '../../models/playback.models';
import {
  UserModel,
  UserPayloadModel,
  UserRemoveModel,
  UserUpdateModel,
} from '../../models/user.models';
import { EVENTS } from '../../utils/events.utils';
import { PlaybackService } from './playback.service';
import { UsersService } from './users.service';
import { WssService } from './wss.services';

export class Playlist {
  constructor(
    private readonly userService = new UsersService(),
    private readonly playbackService = new PlaybackService()
  ) {}

  public getPlaylist(listId: string) {
    const availableUsers = this.userService.getUsersOfList(listId);

    const currentPlayback = this.playbackService.getPlaybackById(listId);

    return {
      users: availableUsers,
      playback: currentPlayback,
    };
  }

  public onConnection(listId: string) {
    const playlist = this.getPlaylist(listId);

    WssService.instance.sendMessage(EVENTS.INIT_PLAYLIST, playlist);
  }

  public startPlaylist(listId: string, payload: InitPlaybackModel) {
    const { result: users } = this.userService.startPlaylist(listId);

    const { result: playback, error } = this.playbackService.initPlayback(
      listId,
      payload
    );

    if (error || !playback?.url) {
      WssService.instance.sendMessage(EVENTS.ERROR, {
        message: !playback?.url ? 'playback do not exists' : error,
      });
      return;
    }

    console.log(`Starting playlist...`);

    WssService.instance.sendMessage(EVENTS.PLAYLIST_STARTED, {
      users,
      playback,
    });
  }

  public updatePlaylist(listId: string, msg: Record<string, unknown>) {
    let users: UserModel[] | null = null;
    let playback: PlaybackModel | null = null;

    console.log(`Playlist updating for event ${msg.event}`);

    if (msg.event === EVENTS.UPDATE_USER) {
      const { result, error } = this.userService.updateUser(
        listId,
        msg.data as UserUpdateModel
      );

      if (error || !result) {
        WssService.instance.sendMessage('error', {
          message: error,
        });
        return;
      }

      users = result;
    } else {
      users = this.userService.getUsersOfList(listId);
    }

    if (msg.event === EVENTS.UPDATE_PLAYBACK) {
      const { result, error } = this.playbackService.updatePlayback(
        listId,
        msg.data as UpdatePlaybackModel
      );

      if (error || !result) {
        WssService.instance.sendMessage('error', {
          message: error,
        });
        return;
      }

      playback = result;
    } else {
      playback = this.playbackService.getPlaybackById(listId);
    }

    WssService.instance.sendMessage(EVENTS.UPDATE_PLAYLIST, {
      users,
      playback,
    });
  }

  public addUserToPlaylist(listId: string, payload: UserPayloadModel) {
    const { result: newUserList, error } = this.userService.addUserInList(
      listId,
      payload
    );

    if (error) {
      console.error(error);
      WssService.instance.sendMessage(EVENTS.ERROR, {
        message: error,
      });
      return;
    }

    WssService.instance.sendMessage(EVENTS.USER_ADDED, {
      users: newUserList,
    });
  }

  private userUrlIsInPlayback(listId: string, user: UserModel) {
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

    // if true => end list event
    if (isLastIndex) {
      console.log(`User ${user.username} is last user: ENDING the playlist...`);

      this.endPlaylist(listId);

      WssService.instance.sendMessage(EVENTS.PLAYLIST_ENDED, {
        listId,
      });
      return;
    }

    // if false => update playback with next user
    const { error: removedError, result: newUsers } =
      this.userService.removeUser(listId, { username: user.username });

    if (removedError || !newUsers) {
      console.error(removedError);
      WssService.instance.sendMessage('error', {
        message: removedError,
      });
      return;
    }

    const newUrl = newUsers[indexToRemove].url;

    const { error, result: playback } = this.playbackService.updatePlayback(
      listId,
      {
        url: newUrl,
      }
    );

    if (error) {
      console.error(error);
      WssService.instance.sendMessage('error', {
        message: removedError,
      });
      return;
    }
    console.log(
      `Updating playlist with url ${newUrl} of user ${newUsers[indexToRemove].username}`
    );
    WssService.instance.sendMessage(EVENTS.USER_OF_PLAYBACK_LOGOUT, {
      listId,
      users: newUsers,
      playback,
    });

    return;
  }

  public removeUser(listId: string, payload: UserRemoveModel) {
    console.log('removin user: ', payload?.username);
    // get user
    const { error: getError, result: user } =
      this.userService.getUserByUsername(listId, payload.username);

    if (getError || !user) {
      console.error(getError);
      WssService.instance.sendMessage('error', {
        message: getError,
      });
      return;
    }

    // check if user is host
    if (user.host) {
      console.log(`HOST user ${user.username} logging out...`);

      this.endPlaylist(listId);

      return WssService.instance.sendMessage(EVENTS.PLAYLIST_ENDED, {
        listId,
      });
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
      WssService.instance.sendMessage('error', {
        message: error,
      });
      return;
    }

    // if no users are left, end playlist
    if (!result?.length) {
      return this.endPlaylist(listId);
    }

    console.log(`Removing user ${user.username}...`);

    WssService.instance.sendMessage(EVENTS.USER_REMOVED, {
      listId,
      users: result,
    });
  }

  public endPlaylist(listId: string) {
    this.userService.removeUsersList(listId);
    this.playbackService.removePlayback(listId);
  }

  public onMessage(listId: string, msg: Record<string, unknown>) {
    console.log('');
    console.log('event: ', msg.event);
    if (msg.event === EVENTS.START_PLAYLIST) {
      this.startPlaylist(listId, msg.data as InitPlaybackModel);
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

    if (
      msg.event === EVENTS.UPDATE_PLAYBACK ||
      msg.event === EVENTS.UPDATE_USER
    ) {
      this.updatePlaylist(listId, msg);
    }
  }
}
