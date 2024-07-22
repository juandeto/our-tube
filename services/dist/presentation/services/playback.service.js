"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaybackService = void 0;
const events_utils_1 = require("../../utils/events.utils");
class PlaybackService {
    constructor() {
        this._playbacks = {};
    }
    getPlaybackById(listId) {
        console.log('getting playback: ', listId);
        return this._playbacks[listId] ? this._playbacks[listId] : null;
    }
    setPlaybackOfList(listId, playback) {
        this._playbacks[listId] = playback;
        return playback;
    }
    initPlayback(listId, body) {
        console.log('playback initializating: ', listId, body);
        const playback = this.setPlaybackOfList(listId, {
            url: body === null || body === void 0 ? void 0 : body.url,
            started_time: new Date(),
        });
        console.log(`Playback of list ${listId} inited: `);
        return { result: playback };
    }
    removePlayback(listId) {
        try {
            delete this._playbacks[listId];
            return true;
        }
        catch (error) {
            return false;
        }
    }
    updatePlayback(listId, body) {
        console.log('Updating playback with url: ', body === null || body === void 0 ? void 0 : body.url);
        let playback = this.getPlaybackById(listId);
        if (!playback) {
            return { error: 'playback do not exists' };
        }
        playback.url = body.url;
        playback.started_time = new Date();
        console.log(`Playback of list ${listId} updated with url ${playback.url}`);
        return { result: playback };
    }
    onMessage(listId, msg) {
        if (msg.event === events_utils_1.EVENTS.START_PLAYLIST) {
            this.initPlayback(listId, msg.data);
        }
        if (msg.event === events_utils_1.EVENTS.GET_PLAYBACK) {
            this.getPlaybackById(listId);
            return;
        }
        if (msg.event === events_utils_1.EVENTS.PLAYBACK_INIT) {
            this.initPlayback(listId, msg.data);
            return;
        }
        if (msg.event === events_utils_1.EVENTS.UPDATE_PLAYBACK) {
            this.updatePlayback(listId, msg.data);
        }
    }
}
exports.PlaybackService = PlaybackService;
