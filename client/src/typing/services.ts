import { STATUS_TYPE } from './shared';

export interface GetVideoListParams {
  id: string;
}

export interface UpdateVideoListBody {
  subject?: string;
  title?: string;
  status?: STATUS_TYPE;
}

export interface UpdateVideoListData {
  body: UpdateVideoListBody;
  id: string;
}
