import { WebSocket } from 'ws';

export interface ResponseModel<T> {
  result?: T;
  error?: any;
}

export interface ErrorService {
  error: string;
}

export interface Record extends WebSocket {}
