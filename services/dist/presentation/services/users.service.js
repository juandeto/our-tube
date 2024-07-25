'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UsersService = void 0;
const uuid_adapter_1 = require('../../config/uuid.adapter');
const video_list_models_1 = require('../../models/video-list.models');
const events_utils_1 = require('../../utils/events.utils');
class UsersService {
  constructor() {
    this._users = {};
  }
  getUsersOfList(listId) {
    return this._users[listId]
      ? this._users[listId]
      : (this._users[listId] = []);
  }
  setUsersOfList(listId, users) {
    this._users[listId] = users;
    return users;
  }
  getUserByUsername(listId, username) {
    let usersOfList = this.getUsersOfList(listId);
    const user = usersOfList.find(
      (user) =>
        (user === null || user === void 0 ? void 0 : user.username) === username
    );
    if (!user) {
      return { error: `username ${username} don't exists in list ${listId}` };
    }
    return { result: user };
  }
  removeUsersList(listId) {
    console.log(`Removing users of list ${listId}`);
    try {
      delete this._users[listId];
      return true;
    } catch (error) {
      return false;
    }
  }
  addUserInList(listId, body) {
    const usersOfList = this.getUsersOfList(listId);
    const newUser = Object.assign(
      Object.assign(
        Object.assign(
          { id: uuid_adapter_1.UuidAdapter.v4() },
          (usersOfList === null || usersOfList === void 0
            ? void 0
            : usersOfList.length) === 0 && {
            status: video_list_models_1.STATUS_LIST.NOT_STARTED,
          }
        ),
        {
          host:
            (usersOfList === null || usersOfList === void 0
              ? void 0
              : usersOfList.length) === 0
              ? true
              : false,
        }
      ),
      body
    );
    const usernameExists =
      usersOfList.findIndex((user) => user.username === body.username) !== -1;
    console.log('Checking if username already exists: ', usernameExists);
    if (
      (usersOfList === null || usersOfList === void 0
        ? void 0
        : usersOfList.length) === 0 ||
      !usernameExists
    ) {
      usersOfList.push(newUser);
      const newList = this.getUsersOfList(listId);
      console.log(`User ${body.username} added `);
      return { result: newList };
    } else {
      return { error: 'username already exists' };
    }
  }
  removeUser(listId, body) {
    let usersOfList = this.getUsersOfList(listId);
    if (!(body === null || body === void 0 ? void 0 : body.username)) {
      return { error: 'invalid id' };
    }
    const newList = usersOfList.filter(
      (user) =>
        (user === null || user === void 0 ? void 0 : user.username) !=
        (body === null || body === void 0 ? void 0 : body.username)
    );
    console.log(`User ${body.username} removed `);
    return { result: this.setUsersOfList(listId, newList) };
  }
  updateUser(listId, body) {
    let usersOfList = this.getUsersOfList(listId);
    if (!(body === null || body === void 0 ? void 0 : body.username)) {
      return { error: 'username is necesary' };
    }
    const indexToUpdate = usersOfList.findIndex(
      (user) =>
        (user === null || user === void 0 ? void 0 : user.username) ===
        (body === null || body === void 0 ? void 0 : body.username)
    );
    if (indexToUpdate === -1) {
      return { error: 'username not found' };
    }
    usersOfList[indexToUpdate] = Object.assign(
      Object.assign({}, usersOfList[indexToUpdate]),
      body
    );
    console.log(`User ${body.username} updated `);
    return { result: this.setUsersOfList(listId, usersOfList) };
  }
  startPlaylist(listId) {
    let usersOfList = this.getUsersOfList(listId);
    const updateUsers = usersOfList.map((user) => {
      if (
        (user === null || user === void 0 ? void 0 : user.status) &&
        user.host
      ) {
        user.status = video_list_models_1.STATUS_LIST.PLAYING;
      }
      return user;
    });
    this.setUsersOfList(listId, updateUsers);
    return { result: updateUsers };
  }
  onMessage(listId, msg) {
    if (msg.event === events_utils_1.EVENTS.ADD_USER) {
      this.addUserInList(listId, msg.data);
    }
    if (msg.event === events_utils_1.EVENTS.REMOVE_USER) {
      this.removeUser(listId, msg.data);
    }
    if (msg.event === events_utils_1.EVENTS.START_PLAYLIST) {
      this.startPlaylist(listId);
    }
    if (msg.event === events_utils_1.EVENTS.UPDATE_USER) {
      this.updateUser(listId, msg.data);
    }
  }
}
exports.UsersService = UsersService;
