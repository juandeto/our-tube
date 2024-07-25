import { UuidAdapter } from '../../config/uuid.adapter';
import {
  UserCreateModel,
  UserModel,
  UserPayloadModel,
  UserRemoveModel,
} from '../../models/user.models';
import { STATUS_LIST } from '../../models/video-list.models';
import { EVENTS } from '../../utils/events.utils';
import { WssService } from './wss.services';

export class UsersService {
  private readonly _users: Record<string, UserModel[]> = {};

  constructor() {}

  public getUsersOfList(listId: string): UserModel[] {
    return this._users[listId]
      ? this._users[listId]
      : (this._users[listId] = []);
  }

  public setUsersOfList(listId: string, users: UserModel[]): UserModel[] {
    this._users[listId] = users;

    return users;
  }

  public removeUsersList(listId: string) {
    try {
      delete this._users[listId];

      return true;
    } catch (error) {
      return false;
    }
  }

  public addUserInList(listId: string, body: UserCreateModel) {
    const usersOfList = this.getUsersOfList(listId);

    const newUser = {
      id: UuidAdapter.v4(),
      status: body?.status ? body?.status : STATUS_LIST.NOT_STARTED,
      host: usersOfList?.length === 0 ? true : false,
      ...body,
    };

    if (
      usersOfList?.length === 0 ||
      !usersOfList.find((user) => user.username === body.username)
    ) {
      const newList = usersOfList.push(newUser);

      console.log(`User ${body.username} added `);

      WssService.instance.sendMessage('userAdded', {
        users: usersOfList,
      });

      return newList;
    } else {
      WssService.instance.sendMessage('error', {
        message: 'username already exists',
      });
    }
  }

  public removeUser(listId: string, body: UserRemoveModel) {
    let usersOfList = this.getUsersOfList(listId);

    if (!body?.username) {
      WssService.instance.sendMessage('error', {
        message: 'invalid id',
      });

      return;
    }

    const newList = usersOfList.filter(
      (user) => user?.username != body?.username
    );

    // if last user leaves;
    if (!newList?.length) {
      this.removeUsersList(listId);
      return;
    }

    console.log(`User ${body.username} removed `);

    this.setUsersOfList(listId, newList);

    WssService.instance.sendMessage('userRemoved', {
      listId,
      users: newList,
    });
  }

  public onMessage(listId: string, msg: Record<string, unknown>) {
    if (msg.event === EVENTS.ADD_USER) {
      this.addUserInList(listId, msg.data as UserPayloadModel);
    }

    if (msg.event === EVENTS.REMOVE_USER) {
      this.removeUser(listId, msg.data as UserRemoveModel);
    }
  }
}
