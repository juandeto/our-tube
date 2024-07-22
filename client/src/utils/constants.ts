import { STATUS_LIST } from 'typing/shared';

export const VIDEO_STATUS = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  VIDEO_CUED: 5,
} as const;

export const VIDEO_STATUS_TO_STATUS_LIST = {
  [-1]: STATUS_LIST.NOT_STARTED,
  [0]: STATUS_LIST.ENDED,
  [1]: STATUS_LIST.PLAYING,
  [2]: STATUS_LIST.PAUSED,
  [3]: STATUS_LIST.PENDING,
  [5]: STATUS_LIST.PENDING,
};

export const NOTIFICATIONS_MSG = {
  PLAYLIST_STARTED: 'Starting playlist.',
  USER_ADDED: 'User joined.',
  USER_REMOVED: 'A user logged out.',
  PLAYLIST_ENDED: 'Playlist ended.',
  USER_OF_PLAYBACK_LOGOUT: 'Playlist has ended: HOST user logged out.',
};
