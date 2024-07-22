export interface PlaybackModel {
  started_time: Date;
  url: string;
}

export interface InitPlaybackModel {
  url: string;
}

export interface UpdatePlaybackModel {
  url: string;
}
