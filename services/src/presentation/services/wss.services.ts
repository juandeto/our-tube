import { IncomingMessage, Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { UsersService } from './users.service';
import url from 'url';
import { EVENTS } from '../../utils/events.utils';
import { PlaybackService } from './playback.service';
import { Playlist } from './playlist.service';

interface Options {
  server: Server;
  path?: string; // ws
}

export class WssService {
  private static _instance: WssService;
  private wss: WebSocketServer;
  private playlistService: Playlist;
  private clients: Record<string, WebSocket[]> = {};

  private constructor(options: Options) {
    const { server, path = '/ws' } = options; /// ws://localhost:3000/ws

    this.wss = new WebSocketServer({ server, path });
    this.playlistService = new Playlist(); // Initialize Playlist service
    this.start();
  }

  static get instance(): WssService {
    if (!WssService._instance) {
      throw 'WssService is not initialized';
    }

    return WssService._instance;
  }

  static initWss(options: Options) {
    WssService._instance = new WssService(options);
  }

  public sendMessage(type: string, payload: Object, listdId: string) {
    console.log(`Event ${type} sended`);
    console.log('');
    console.log('');
    console.log('');
    this.clients[listdId].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, payload }));
      }
    });
  }

  public onMessageReceived(listId: string, message: Record<string, unknown>) {
    this.playlistService.onMessage(listId, message);
  }

  public onConnection(listId: string) {
    this.playlistService.onConnection(listId);
  }

  public start() {
    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      console.log('Client connected');
      const { listId } = url.parse(request?.url || '', true).query;

      if (!listId || typeof listId !== 'string') return;

      if (!this.clients[listId]) {
        this.clients[listId] = [ws];
      } else {
        this.clients[listId].push(ws);
      }

      this.onConnection(listId);

      ws.on('message', (bytes) => {
        const message = JSON.parse(bytes.toString());

        this.onMessageReceived(listId, message);
      });

      ws.on('close', () => {
        const index = this.clients[listId].indexOf(ws);

        this.clients[listId].splice(index, 1);

        if (this.clients[listId].length === 0) {
          console.log(`Clients of list ${listId} deleted`);
          delete this.clients[listId];
        }

        console.log('Client disconnected');
      });
    });
  }
}
