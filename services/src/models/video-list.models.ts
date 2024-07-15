import { ResponseModel } from './shared';

export const STATUS_LIST = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  IN_ADS: 'IN_ADS',
  DELETED: 'DELETED',
} as const;

export type STATUS_TYPE = (typeof STATUS_LIST)[keyof typeof STATUS_LIST];

export type VideoListModel = {
  id: string;
  date: Date;
  status: string;
  subject: string | null;
  title: string;
};

export type VideoListCreateModel = {
  subject?: string;
  title: string;
};

export type VideoListUpdateModel = {
  date?: Date;
  status?: STATUS_TYPE;
  subject?: string | null;
  title?: string;
};

export interface VideoListCreateResponse
  extends ResponseModel<VideoListModel> {}

export interface VideoListGetByIdResponse
  extends ResponseModel<VideoListModel> {}

export interface VideoListUpdateResponse
  extends ResponseModel<VideoListModel> {}

export interface VideoListDeleteResponse
  extends ResponseModel<VideoListModel> {}
