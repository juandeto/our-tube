import { UuidAdapter } from '../../config/uuid.adapter';
import { ResponseModel } from '../../models/shared';
import {
  UserCreateModel,
  UserModel,
  UserPayloadModel,
  UserRemoveModel,
  UserUpdateModel,
} from '../../models/user.models';
import { STATUS_LIST } from '../../models/video-list.models';
import { EVENTS } from '../../utils/events.utils';

export class UsersService {
  private readonly _users: Record<string, UserModel[]> = {};

  constructor() {}

  public getUsersOfList(listId: string): UserModel[] {
    return this._users[listId]
      ? this._users[listId]
      : (this._users[listId] = []);
  }

  private setUsersOfList(listId: string, users: UserModel[]): UserModel[] {
    this._users[listId] = users;

    return users;
  }

  public getUserByUsername(
    listId: string,
    username: string
  ): ResponseModel<UserModel> {
    let usersOfList = this.getUsersOfList(listId);

    const user = usersOfList.find((user) => user?.username === username);

    if (!user) {
      return { error: `username ${username} don't exists in list ${listId}` };
    }

    return { result: user };
  }

  public removeUsersList(listId: string) {
    console.log(`Removing users of list ${listId}`);
    try {
      delete this._users[listId];

      return true;
    } catch (error) {
      return false;
    }
  }

  public addUserInList(
    listId: string,
    body: UserCreateModel
  ): ResponseModel<UserModel[]> {
    const usersOfList = this.getUsersOfList(listId);

    const newUser = {
      id: UuidAdapter.v4(),
      ...(usersOfList?.length === 0 && {
        status: STATUS_LIST.NOT_STARTED,
      }), // only set STATUS for HOST user
      host: usersOfList?.length === 0 ? true : false,
      ...body,
    };

    const usernameExists =
      usersOfList.findIndex((user) => user.username === body.username) !== -1;

    console.log('Checking if username already exists: ', usernameExists);

    if (usersOfList?.length === 0 || !usernameExists) {
      usersOfList.push(newUser);

      const newList = this.getUsersOfList(listId);

      console.log(`User ${body.username} added `);

      return { result: newList };
    } else {
      return { error: 'username already exists' };
    }
  }

  public removeUser(
    listId: string,
    body: UserRemoveModel
  ): ResponseModel<UserModel[]> {
    let usersOfList = this.getUsersOfList(listId);

    if (!body?.username) {
      return { error: 'invalid id' };
    }

    const newList = usersOfList.filter(
      (user) => user?.username != body?.username
    );

    console.log(`User ${body.username} removed `);

    return { result: this.setUsersOfList(listId, newList) };
  }

  public updateUser(
    listId: string,
    body: UserUpdateModel
  ): ResponseModel<UserModel[]> {
    let usersOfList = this.getUsersOfList(listId);

    if (!body?.username) {
      return { error: 'username is necesary' };
    }

    const indexToUpdate = usersOfList.findIndex(
      (user) => user?.username === body?.username
    );

    if (indexToUpdate === -1) {
      return { error: 'username not found' };
    }

    usersOfList[indexToUpdate] = {
      ...usersOfList[indexToUpdate],
      ...body,
    };

    console.log(`User ${body.username} updated `);

    return { result: this.setUsersOfList(listId, usersOfList) };
  }

  public startPlaylist(listId: string): ResponseModel<UserModel[]> {
    let usersOfList = this.getUsersOfList(listId);

    const updateUsers = usersOfList.map((user) => {
      if (user?.status && user.host) {
        user.status = STATUS_LIST.PLAYING;
      }

      return user;
    });

    this.setUsersOfList(listId, updateUsers);

    return { result: updateUsers };
  }

  public onMessage(listId: string, msg: Record<string, unknown>) {
    if (msg.event === EVENTS.ADD_USER) {
      this.addUserInList(listId, msg.data as UserPayloadModel);
    }

    if (msg.event === EVENTS.REMOVE_USER) {
      this.removeUser(listId, msg.data as UserRemoveModel);
    }

    if (msg.event === EVENTS.START_PLAYLIST) {
      this.startPlaylist(listId);
    }

    if (msg.event === EVENTS.UPDATE_USER) {
      this.updateUser(listId, msg.data as UserUpdateModel);
    }
  }
}
