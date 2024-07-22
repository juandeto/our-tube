"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WssService = void 0;
const ws_1 = require("ws");
const url_1 = __importDefault(require("url"));
const playlist_service_1 = require("./playlist.service");
class WssService {
    constructor(options) {
        const { server, path = '/ws' } = options; /// ws://localhost:3000/ws
        this.wss = new ws_1.WebSocketServer({ server, path });
        this.playlistService = new playlist_service_1.Playlist(); // Initialize Playlist service
        this.start();
    }
    static get instance() {
        if (!WssService._instance) {
            throw 'WssService is not initialized';
        }
        return WssService._instance;
    }
    static initWss(options) {
        WssService._instance = new WssService(options);
    }
    sendMessage(type, payload) {
        console.log(`Event ${type} sended`);
        console.log('');
        console.log('');
        console.log('');
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify({ type, payload }));
            }
        });
    }
    onMessageReceived(listId, message) {
        this.playlistService.onMessage(listId, message);
    }
    onConnection(listId) {
        this.playlistService.onConnection(listId);
    }
    start() {
        this.wss.on('connection', (ws, request) => {
            console.log('Client connected');
            const { listId } = url_1.default.parse((request === null || request === void 0 ? void 0 : request.url) || '', true).query;
            if (!listId || typeof listId !== 'string')
                return;
            this.onConnection(listId);
            ws.on('message', (bytes) => {
                const message = JSON.parse(bytes.toString());
                this.onMessageReceived(listId, message);
            });
            ws.on('close', (bytes, reason) => {
                const message = Buffer.from(reason);
                try {
                    const parsedMessage = JSON.parse(message.toString());
                    console.log('Client disconnected: ', parsedMessage === null || parsedMessage === void 0 ? void 0 : parsedMessage.username);
                    this.onMessageReceived(listId, parsedMessage);
                }
                catch (error) {
                    console.log('Client disconnected with non-JSON message: ', message);
                }
            });
        });
    }
}
exports.WssService = WssService;
