import { YouTubeEvent, YouTubeProps } from 'react-youtube';

export interface ListData {
  subject: string;
  title: string;
}

export const EVENTS = {
  USER_ADDED: 'userAdded',
  ADD_USER: 'addUser',
  REMOVE_USER: 'removeUser',
  USER_REMOVED: 'userRemoved',
  UPDATE_USER: 'updateUser',
  START_PLAYLIST: 'startPlaylist',
  PLAYLIST_STARTED: 'playlistStarted',
} as const;

export type EVENTS_TYPE = (typeof EVENTS)[keyof typeof EVENTS];

export const STATUS_LIST = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  IN_ADS: 'IN_ADS',
  DELETED: 'DELETED',
} as const;

export type STATUS_TYPE = (typeof STATUS_LIST)[keyof typeof STATUS_LIST];

export interface User {
  id: string;
  username: string;
  status: STATUS_TYPE;
  url: string;
  host: boolean;
}

export interface UserCreateModel {
  username: string;
  url: string;
  status?: STATUS_TYPE;
}

export interface WssEventRaw {
  type: EVENTS_TYPE;
}

export interface WssEvent<T> {
  type: EVENTS_TYPE;
  payload: T;
}

export interface UsersResponse {
  users: User[];
}

export interface YoutubePlayerProps {
  videoUrl: string;
  onPlayerReady: (event: YouTubeEvent) => void;
  onPlayerStateChange: (event: YouTubeEvent) => void;
  onPlayerError: (error: YouTubeEvent) => void;
  onPlay: (event: YouTubeEvent) => void;
}
