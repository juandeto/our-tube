import { WebSocket } from 'ws';

export interface ResponseModel<T> {
  result?: T;
  error?: any;
}

export interface WebSocketCustom extends WebSocket {
  isAlive: boolean;
}
