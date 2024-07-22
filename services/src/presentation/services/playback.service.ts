import {
  InitPlaybackModel,
  PlaybackModel,
  UpdatePlaybackModel,
} from '../../models/playback.models';
import { ResponseModel } from '../../models/shared';
import { EVENTS } from '../../utils/events.utils';

export class PlaybackService {
  private readonly _playbacks: Record<string, PlaybackModel> = {};

  constructor() {}

  public getPlaybackById(listId: string) {
    console.log('getting playback: ', listId);
    return this._playbacks[listId] ? this._playbacks[listId] : null;
  }

  private setPlaybackOfList(
    listId: string,
    playback: PlaybackModel
  ): PlaybackModel {
    this._playbacks[listId] = playback;

    return playback;
  }

  public initPlayback(
    listId: string,
    body: InitPlaybackModel
  ): ResponseModel<PlaybackModel> {
    console.log('playback initializating: ', listId, body);

    const playback = this.setPlaybackOfList(listId, {
      url: body?.url,
      started_time: new Date(),
    });

    console.log(`Playback of list ${listId} inited: `);

    return { result: playback };
  }

  public removePlayback(listId: string): boolean {
    try {
      delete this._playbacks[listId];

      return true;
    } catch (error) {
      return false;
    }
  }

  public updatePlayback(
    listId: string,
    body: UpdatePlaybackModel
  ): ResponseModel<PlaybackModel> {
    console.log('Updating playback with url: ', body?.url);

    let playback = this.getPlaybackById(listId);

    if (!playback) {
      return { error: 'playback do not exists' };
    }

    playback.url = body.url;
    playback.started_time = new Date();

    console.log(`Playback of list ${listId} updated with url ${playback.url}`);

    return { result: playback };
  }

  public onMessage(listId: string, msg: Record<string, unknown>) {
    if (msg.event === EVENTS.START_PLAYLIST) {
      this.initPlayback(listId, msg.data as InitPlaybackModel);
    }

    if (msg.event === EVENTS.GET_PLAYBACK) {
      this.getPlaybackById(listId);
      return;
    }

    if (msg.event === EVENTS.PLAYBACK_INIT) {
      this.initPlayback(listId, msg.data as InitPlaybackModel);
      return;
    }

    if (msg.event === EVENTS.UPDATE_PLAYBACK) {
      this.updatePlayback(listId, msg.data as UpdatePlaybackModel);
    }
  }
}
