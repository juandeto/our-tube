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

  public sendMessage(type: string, payload: Object) {
    console.log(`Event ${type} sended`);
    console.log('');
    console.log('');
    console.log('');
    this.wss.clients.forEach((client) => {
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

      this.onConnection(listId);

      ws.on('message', (bytes) => {
        const message = JSON.parse(bytes.toString());

        this.onMessageReceived(listId, message);
      });

      ws.on('close', (bytes, reason) => {
        const message = Buffer.from(reason);
        try {
          const parsedMessage = JSON.parse(message.toString());
          console.log('Client disconnected: ', parsedMessage?.username);

          this.onMessageReceived(listId, parsedMessage);
        } catch (error) {
          console.log('Client disconnected with non-JSON message: ', message);
        }
      });
    });
  }
}
