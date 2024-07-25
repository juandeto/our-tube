import { YouTubeEvent } from 'react-youtube';

export interface ListData {
  subject: string;
  title: string;
}

export const EVENTS = {
  INIT_PLAYLIST: 'initPlaylist',
  GET_PLAYLIST: 'getPlaylist',
  UPDATE_PLAYLIST: 'updatePlaylist',
  PLAYLIST_ENDED: 'playlistEnded',
  USER_OF_PLAYBACK_LOGOUT: 'userOfPlaybackLogout',
  ADD_USER: 'addUser',
  USER_ADDED: 'userAdded',
  REMOVE_USER: 'removeUser',
  USER_REMOVED: 'userRemoved',
  START_PLAYLIST: 'startPlaylist',
  PLAYLIST_STARTED: 'playlistStarted',
  UPDATE_USER: 'updateUser',
  ERROR: 'error',
  INIT_USERS: 'initUsers',
  PLAYBACK_INIT: 'initPlayback',
  GET_PLAYBACK: 'getPlayback',
  UPDATE_PLAYBACK: 'updatePlayback',
  PLAYBACK_UPDATED: 'playbackUpdated',
  SEND_CHAT_MSG: 'sendChatMsg',
  RESEND_CHAT_MSG: 'resendChatMsg',
  NEXT_VIDEO: 'nextVideo',
  ADD_VOTE: 'addVote',
  UPDATED_VOTING_RESULTS: 'updateVotingResults',
} as const;

export type EVENTS_TYPE = (typeof EVENTS)[keyof typeof EVENTS];

export const STATUS_LIST = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
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

export interface Playback {
  url: string;
  started_time: Date;
}

export interface MessageResponse {
  users?: User[];
  playback?: Playback;
  user?: User;
  chatMsg?: UserChatResponse;
  listId?: string;
  reason?: string;
  votes?: VoteUser[];
}

export interface YoutubePlayerProps {
  videoUrl: string;
  onPlayerReady: (event: YouTubeEvent) => void;
  onPlayerStateChange: (event: YouTubeEvent) => void;
  onPlayerError: (error: YouTubeEvent) => void;
  onPlay: (event: YouTubeEvent) => void;
}

export enum ReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
  UNINSTANTIATED,
}

export interface UserChatMsg {
  message: string;
  username: string;
}

export interface UserChatResponse {
  listId: string;
  message: UserChatMsg;
}

export enum VOTES_TYPES {
  REPEAT,
  NEXT,
}

export interface VoteUser {
  vote: VOTES_TYPES;
  username: string;
}
