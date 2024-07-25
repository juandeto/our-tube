import { STATUS_TYPE } from './video-list.models';

export interface UserModel {
  id: string;
  username: string;
  url: string;
  status?: STATUS_TYPE;
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

export interface UserGetModel {
  username: string;
}

export interface UserUpdateModel {
  id: string;
  username: string;
  url?: string;
  status?: STATUS_TYPE;
  host?: boolean;
}

export interface UserChatMsg {
  message: string;
  username: string;
}
