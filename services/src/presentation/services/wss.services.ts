import { IncomingMessage, Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { UsersService } from './users.service';
import url from 'url';

interface Options {
  server: Server;
  path?: string; // ws
}

export class WssService {
  private static _instance: WssService;
  private wss: WebSocketServer;

  private constructor(
    options: Options,
    private readonly userService = new UsersService()
  ) {
    const { server, path = '/ws' } = options; /// ws://localhost:3000/ws

    this.wss = new WebSocketServer({ server, path });
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
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, payload }));
      }
    });
  }

  public onMessageReceived(listId: string, message: Record<string, unknown>) {
    console.log('message received: ', message);

    this.userService.onMessage(listId, message);
  }

  public start() {
    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      console.log('Client connected');
      const { listId } = url.parse(request?.url || '', true).query;

      if (!listId || typeof listId !== 'string') return;

      ws.on('message', (bytes) => {
        console.log('request: ', request.url);

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
