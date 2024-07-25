"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const uuid_adapter_1 = require("../../config/uuid.adapter");
const video_list_models_1 = require("../../models/video-list.models");
const events_utils_1 = require("../../utils/events.utils");
const wss_services_1 = require("./wss.services");
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
    removeUsersList(listId) {
        try {
            delete this._users[listId];
            return true;
        }
        catch (error) {
            return false;
        }
    }
    addUserInList(listId, body) {
        const usersOfList = this.getUsersOfList(listId);
        const newUser = Object.assign({ id: uuid_adapter_1.UuidAdapter.v4(), status: (body === null || body === void 0 ? void 0 : body.status) ? body === null || body === void 0 ? void 0 : body.status : video_list_models_1.STATUS_LIST.NOT_STARTED, host: (usersOfList === null || usersOfList === void 0 ? void 0 : usersOfList.length) === 0 ? true : false }, body);
        if ((usersOfList === null || usersOfList === void 0 ? void 0 : usersOfList.length) === 0 ||
            !usersOfList.find((user) => user.username === body.username)) {
            const newList = usersOfList.push(newUser);
            console.log(`User ${body.username} added `);
            wss_services_1.WssService.instance.sendMessage('userAdded', {
                users: usersOfList,
            });
            return newList;
        }
        else {
            wss_services_1.WssService.instance.sendMessage('error', {
                message: 'username already exists',
            });
        }
    }
    removeUser(listId, body) {
        let usersOfList = this.getUsersOfList(listId);
        if (!(body === null || body === void 0 ? void 0 : body.username)) {
            wss_services_1.WssService.instance.sendMessage('error', {
                message: 'invalid id',
            });
            return;
        }
        const newList = usersOfList.filter((user) => (user === null || user === void 0 ? void 0 : user.username) != (body === null || body === void 0 ? void 0 : body.username));
        // if last user leaves;
        if (!(newList === null || newList === void 0 ? void 0 : newList.length)) {
            this.removeUsersList(listId);
            return;
        }
        console.log(`User ${body.username} removed `);
        this.setUsersOfList(listId, newList);
        wss_services_1.WssService.instance.sendMessage('userRemoved', {
            listId,
            users: newList,
        });
    }
    onMessage(listId, msg) {
        if (msg.event === events_utils_1.EVENTS.ADD_USER) {
            this.addUserInList(listId, msg.data);
        }
        if (msg.event === events_utils_1.EVENTS.REMOVE_USER) {
            this.removeUser(listId, msg.data);
        }
    }
}
exports.UsersService = UsersService;
