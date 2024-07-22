"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playlist = void 0;
const events_utils_1 = require("../../utils/events.utils");
const playback_service_1 = require("./playback.service");
const users_service_1 = require("./users.service");
const wss_services_1 = require("./wss.services");
class Playlist {
    constructor(userService = new users_service_1.UsersService(), playbackService = new playback_service_1.PlaybackService()) {
        this.userService = userService;
        this.playbackService = playbackService;
    }
    getPlaylist(listId) {
        const availableUsers = this.userService.getUsersOfList(listId);
        const currentPlayback = this.playbackService.getPlaybackById(listId);
        return {
            users: availableUsers,
            playback: currentPlayback,
        };
    }
    onConnection(listId) {
        const playlist = this.getPlaylist(listId);
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.INIT_PLAYLIST, playlist);
    }
    startPlaylist(listId, payload) {
        const { result: users } = this.userService.startPlaylist(listId);
        const { result: playback, error } = this.playbackService.initPlayback(listId, payload);
        if (error || !(playback === null || playback === void 0 ? void 0 : playback.url)) {
            wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.ERROR, {
                message: !(playback === null || playback === void 0 ? void 0 : playback.url) ? 'playback do not exists' : error,
            });
            return;
        }
        console.log(`Starting playlist...`);
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.PLAYLIST_STARTED, {
            users,
            playback,
        });
    }
    updatePlaylist(listId, msg) {
        let users = null;
        let playback = null;
        console.log(`Playlist updating for event ${msg.event}`);
        if (msg.event === events_utils_1.EVENTS.UPDATE_USER) {
            const { result, error } = this.userService.updateUser(listId, msg.data);
            if (error || !result) {
                wss_services_1.WssService.instance.sendMessage('error', {
                    message: error,
                });
                return;
            }
            users = result;
        }
        else {
            users = this.userService.getUsersOfList(listId);
        }
        if (msg.event === events_utils_1.EVENTS.UPDATE_PLAYBACK) {
            const { result, error } = this.playbackService.updatePlayback(listId, msg.data);
            if (error || !result) {
                wss_services_1.WssService.instance.sendMessage('error', {
                    message: error,
                });
                return;
            }
            playback = result;
        }
        else {
            playback = this.playbackService.getPlaybackById(listId);
        }
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.UPDATE_PLAYLIST, {
            users,
            playback,
        });
    }
    addUserToPlaylist(listId, payload) {
        const { result: newUserList, error } = this.userService.addUserInList(listId, payload);
        if (error) {
            console.error(error);
            wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.ERROR, {
                message: error,
            });
            return;
        }
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.USER_ADDED, {
            users: newUserList,
        });
    }
    userUrlIsInPlayback(listId, user) {
        const playback = this.playbackService.getPlaybackById(listId);
        console.log(`checking if user url ${user.url} is equal to playback ${playback === null || playback === void 0 ? void 0 : playback.url} ---> `, this.userService.getUsersOfList(listId));
        return user.url === (playback === null || playback === void 0 ? void 0 : playback.url);
    }
    removeUserInPlayback(listId, user) {
        // get the user list
        const userList = this.userService.getUsersOfList(listId);
        // check if user to be removed is the last
        const indexToRemove = userList.indexOf(user);
        const isLastIndex = indexToRemove === userList.length - 1;
        // if true => end list event
        if (isLastIndex) {
            console.log(`User ${user.username} is last user: ENDING the playlist...`);
            this.endPlaylist(listId);
            wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.PLAYLIST_ENDED, {
                listId,
            });
            return;
        }
        // if false => update playback with next user
        const { error: removedError, result: newUsers } = this.userService.removeUser(listId, { username: user.username });
        if (removedError || !newUsers) {
            console.error(removedError);
            wss_services_1.WssService.instance.sendMessage('error', {
                message: removedError,
            });
            return;
        }
        const newUrl = newUsers[indexToRemove].url;
        const { error, result: playback } = this.playbackService.updatePlayback(listId, {
            url: newUrl,
        });
        if (error) {
            console.error(error);
            wss_services_1.WssService.instance.sendMessage('error', {
                message: removedError,
            });
            return;
        }
        console.log(`Updating playlist with url ${newUrl} of user ${newUsers[indexToRemove].username}`);
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.USER_OF_PLAYBACK_LOGOUT, {
            listId,
            users: newUsers,
            playback,
        });
        return;
    }
    removeUser(listId, payload) {
        console.log('removin user: ', payload === null || payload === void 0 ? void 0 : payload.username);
        // get user
        const { error: getError, result: user } = this.userService.getUserByUsername(listId, payload.username);
        if (getError || !user) {
            console.error(getError);
            wss_services_1.WssService.instance.sendMessage('error', {
                message: getError,
            });
            return;
        }
        // check if user is host
        if (user.host) {
            console.log(`HOST user ${user.username} logging out...`);
            this.endPlaylist(listId);
            return wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.PLAYLIST_ENDED, {
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
            wss_services_1.WssService.instance.sendMessage('error', {
                message: error,
            });
            return;
        }
        // if no users are left, end playlist
        if (!(result === null || result === void 0 ? void 0 : result.length)) {
            return this.endPlaylist(listId);
        }
        console.log(`Removing user ${user.username}...`);
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.USER_REMOVED, {
            listId,
            users: result,
        });
    }
    endPlaylist(listId) {
        this.userService.removeUsersList(listId);
        this.playbackService.removePlayback(listId);
    }
    onMessage(listId, msg) {
        console.log('');
        console.log('event: ', msg.event);
        if (msg.event === events_utils_1.EVENTS.START_PLAYLIST) {
            this.startPlaylist(listId, msg.data);
        }
        if (msg.event === events_utils_1.EVENTS.GET_PLAYLIST) {
            this.getPlaylist(listId);
            return;
        }
        if (msg.event === events_utils_1.EVENTS.ADD_USER) {
            this.addUserToPlaylist(listId, msg.data);
        }
        if (msg.event === events_utils_1.EVENTS.REMOVE_USER) {
            this.removeUser(listId, msg.data);
        }
        if (msg.event === events_utils_1.EVENTS.UPDATE_PLAYBACK ||
            msg.event === events_utils_1.EVENTS.UPDATE_USER) {
            this.updatePlaylist(listId, msg);
        }
    }
}
exports.Playlist = Playlist;
