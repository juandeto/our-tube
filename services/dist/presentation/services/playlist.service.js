"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playlist = void 0;
const events_utils_1 = require("../../utils/events.utils");
const playback_service_1 = require("./playback.service");
const users_service_1 = require("./users.service");
const votes_service_1 = require("./votes.service");
const wss_services_1 = require("./wss.services");
class Playlist {
    constructor(userService = new users_service_1.UsersService(), playbackService = new playback_service_1.PlaybackService(), votesService = new votes_service_1.VotesService()) {
        this.userService = userService;
        this.playbackService = playbackService;
        this.votesService = votesService;
    }
    getPlaylist(listId) {
        const availableUsers = this.userService.getUsersOfList(listId);
        const currentPlayback = this.playbackService.getPlaybackById(listId);
        const currentVotes = this.votesService.getListVotes(listId);
        return {
            users: availableUsers,
            playback: currentPlayback,
            votes: currentVotes,
        };
    }
    onConnection(listId) {
        const playlist = this.getPlaylist(listId);
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.INIT_PLAYLIST, playlist, listId);
    }
    startPlaylist(listId, payload) {
        var _a, _b;
        if (!((_a = payload === null || payload === void 0 ? void 0 : payload.user) === null || _a === void 0 ? void 0 : _a.host)) {
            wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.ERROR, {
                message: 'Playlist only can be started by host',
                username: (_b = payload === null || payload === void 0 ? void 0 : payload.user) === null || _b === void 0 ? void 0 : _b.username,
            }, listId);
            return;
        }
        const { result: users } = this.userService.startPlaylist(listId);
        if (!users)
            return;
        const { result: playback, error } = this.playbackService.initPlayback(listId, { url: users[0].url });
        if (error || !(playback === null || playback === void 0 ? void 0 : playback.url)) {
            wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.ERROR, {
                message: !(playback === null || playback === void 0 ? void 0 : playback.url) ? 'playback do not exists' : error,
            }, listId);
            return;
        }
        console.log(`Starting playlist...`);
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.PLAYLIST_STARTED, {
            users,
            playback,
        }, listId);
    }
    endPlaylist(listId, reason) {
        console.log('Reason of ending: ', reason);
        this.userService.removeUsersList(listId);
        this.playbackService.removePlayback(listId);
        this.votesService.removeVotesList(listId);
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.PLAYLIST_ENDED, { reason }, listId);
    }
    addUserToPlaylist(listId, payload) {
        const { result: newUserList, error } = this.userService.addUserInList(listId, payload);
        if (error) {
            console.error(error);
            wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.ERROR, {
                message: error,
                username: payload === null || payload === void 0 ? void 0 : payload.username,
            }, listId);
            return;
        }
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.USER_ADDED, {
            users: newUserList,
        }, listId);
    }
    updateUser(listId, payload) {
        let users = null;
        const { result, error } = this.userService.updateUser(listId, payload);
        if (error || !result) {
            wss_services_1.WssService.instance.sendMessage('error', {
                username: payload === null || payload === void 0 ? void 0 : payload.username,
                message: error,
            }, listId);
            return;
        }
        users = result;
        return users;
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
        console.log('indexToRemove: ', indexToRemove);
        console.log('last index: ', userList.length - 1);
        // if true => end list event
        if (isLastIndex) {
            console.log(`User ${user.username} is last user: ENDING the playlist...`);
            this.endPlaylist(listId, 'Last user video was playing, but he logged out.');
            return;
        }
        // if false => update playback with next user
        const { error: removedError, result: newUsers } = this.userService.removeUser(listId, { username: user.username });
        if (removedError || !newUsers) {
            console.error(removedError);
            wss_services_1.WssService.instance.sendMessage('error', {
                message: removedError,
            }, listId);
            return;
        }
        const newVotes = this.votesService.removeUserVote(listId, user.username);
        const newUrl = newUsers[indexToRemove].url;
        const { error, result: playback } = this.playbackService.nextVideo(listId, {
            url: newUrl,
        });
        if (error) {
            console.error(error);
            wss_services_1.WssService.instance.sendMessage('error', {
                message: removedError,
            }, listId);
            return;
        }
        console.log(`Updating playlist with url ${newUrl} of user ${newUsers[indexToRemove].username}`);
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.USER_OF_PLAYBACK_LOGOUT, {
            users: newUsers,
            playback,
            votes: newVotes,
        }, listId);
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
            }, listId);
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
            wss_services_1.WssService.instance.sendMessage('error', {
                message: error,
            }, listId);
            return;
        }
        const newVotes = this.votesService.removeUserVote(listId, payload.username);
        // if no users are left, end playlist
        if (!(result === null || result === void 0 ? void 0 : result.length)) {
            return this.endPlaylist(listId, 'All users looged out');
        }
        console.log(`Removing user ${user.username}...`);
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.USER_REMOVED, {
            listId,
            users: result,
            votes: newVotes,
        }, listId);
    }
    updatePlayback(listId, payload) {
        var _a, _b;
        if (!((_a = payload === null || payload === void 0 ? void 0 : payload.user) === null || _a === void 0 ? void 0 : _a.host)) {
            wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.ERROR, {
                message: 'Playlist only can be updated by host',
                username: (_b = payload === null || payload === void 0 ? void 0 : payload.user) === null || _b === void 0 ? void 0 : _b.username,
            }, listId);
            return;
        }
        let playback = null;
        console.log(`Playlist getting next video...`);
        // get user index of current playback
        const nextVideoUrl = this.getNextVideoUrl(listId);
        console.log('nextVideoUrl: ', nextVideoUrl);
        if (!nextVideoUrl) {
            return this.endPlaylist(listId, 'There are no more videos. Playlist has ended');
        }
        const { result, error } = this.playbackService.nextVideo(listId, {
            url: nextVideoUrl,
        });
        if (error || !result) {
            wss_services_1.WssService.instance.sendMessage('error', {
                message: error,
            }, listId);
            return;
        }
        playback = result;
        const resetedVotes = this.votesService.cleanVotesOfList(listId);
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.UPDATE_PLAYLIST, {
            playback,
            votes: resetedVotes,
        }, listId);
    }
    getNextVideoUrl(listId) {
        const userList = this.userService.getUsersOfList(listId);
        const currentPlayback = this.playbackService.getPlaybackById(listId);
        const currIndex = userList.findIndex((user) => user.url === (currentPlayback === null || currentPlayback === void 0 ? void 0 : currentPlayback.url));
        console.log('currIndex: ', currIndex, 'userList: ', userList);
        if (currIndex === -1) {
            return null;
        }
        if (currIndex + 1 > userList.length - 1) {
            return null;
        }
        return userList[currIndex + 1].url;
    }
    onUserChatMessage(listId, payload) {
        wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.RESEND_CHAT_MSG, {
            listId,
            chatMsg: payload,
        }, listId);
    }
    onAddVote(listId, payload) {
        const { result, error } = this.userService.getUserByUsername(listId, payload.username);
        const list = this.playbackService.getPlaybackById(listId);
        if (!list) {
            wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.ERROR, {
                message: 'Playlist must start if you want to vote',
                username: payload === null || payload === void 0 ? void 0 : payload.username,
            }, listId);
            return;
        }
        if (error || !result) {
            wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.ERROR, {
                message: 'You must be logged in to vote',
                username: payload === null || payload === void 0 ? void 0 : payload.username,
            }, listId);
            return;
        }
        const votes = this.votesService.voteInList(listId, payload);
        return wss_services_1.WssService.instance.sendMessage(events_utils_1.EVENTS.UPDATED_VOTING_RESULTS, {
            votes,
        }, listId);
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
        if (msg.event === events_utils_1.EVENTS.NEXT_VIDEO) {
            this.updatePlayback(listId, msg.data);
        }
        if (msg.event === events_utils_1.EVENTS.UPDATE_USER) {
            this.updateUser(listId, msg.data);
        }
        if (msg.event === events_utils_1.EVENTS.SEND_CHAT_MSG) {
            this.onUserChatMessage(listId, msg.data);
        }
        if (msg.event === events_utils_1.EVENTS.ADD_VOTE) {
            this.onAddVote(listId, msg.data);
        }
    }
}
exports.Playlist = Playlist;
