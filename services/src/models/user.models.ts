import { STATUS_TYPE } from './video-list.models';

export interface UserModel {
  id: string;
  username: string;
  url: string;
  status: STATUS_TYPE;
  host: boolean;
}

export interface UserPayloadModel {
  listId: string;
  username: string;
  url: string;
  status?: STATUS_TYPE;
}

export interface UserCreateModel {
  username: string;
  url: string;
  status?: STATUS_TYPE;
}

export interface UserRemoveModel {
  username: string;
}
