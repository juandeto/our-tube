import { UuidAdapter } from '../../config/uuid.adapter';
import {
  STATUS_LIST,
  VideoListCreateModel,
  VideoListCreateResponse,
  VideoListDeleteResponse,
  VideoListGetByIdResponse,
  VideoListModel,
  VideoListUpdateModel,
  VideoListUpdateResponse,
} from '../../models/video-list.models';
import { prisma } from '../../data/postgres';
import { WssService } from './wss.services';

export class VideoListService {
  constructor(private readonly wssService = WssService.instance) {}

  private readonly _videoList: VideoListModel[] = [];

  public get activeVideoLists(): VideoListModel[] {
    return this._videoList.filter((vl) => vl?.status !== 'DELETED');
  }

  public async createVideoList(
    videoList: VideoListCreateModel
  ): Promise<VideoListCreateResponse> {
    const uuid = UuidAdapter.v4();

    const { title, subject } = videoList;

    try {
      const createdVideoList = await prisma.videoList.create({
        data: {
          title: title,
          subject: subject || '',
          id: uuid,
          status: STATUS_LIST.PENDING,
        },
      });

      if (!createdVideoList) {
        return { error: `Error creating the video list` };
      }

      return { result: createdVideoList };
    } catch (error) {
      console.log(`Error creating the video list ${error}`);

      return { error: `Error creating the video list ${error}` };
    }
  }

  public async getVideoList(id: string): Promise<VideoListGetByIdResponse> {
    try {
      const videoList = await prisma.videoList.findFirst({
        where: {
          id: id,
        },
      });

      if (!videoList?.id) {
        return { error: `Video list with id ${id} not found` };
      }

      return { result: videoList };
    } catch (error) {
      console.log(`Error getting the video list with id ${id}`);
      console.error(error);

      return { error: error };
    }
  }

  public async updateVideoList(
    id: string,
    updateBody: VideoListUpdateModel
  ): Promise<VideoListUpdateResponse> {
    let videoList = this.getVideoList(id);

    if (!videoList) {
      throw new Error('No video list found');
    }

    const { status, title, subject } = updateBody || {};

    const currentList = await this.getVideoList(id);

    if (currentList?.error) {
      return { error: 'We could not find the list' };
    }

    try {
      const updatedVideoList = await prisma.videoList.update({
        where: {
          id: id,
        },
        data: {
          status: status ? status : currentList.result?.status,
          title: title ? title : currentList.result?.title,
          subject: subject ? subject : currentList.result?.subject,
        },
      });

      return { result: updatedVideoList };
    } catch (error) {
      console.log(`Error updating video list with id ${id}`);

      return { error: `Error updating video list with id ${id}` };
    }
  }

  public async deleteVideoList(id: string): Promise<VideoListDeleteResponse> {
    const { error: errorGetVideoList } = await this.getVideoList(id);

    if (!errorGetVideoList) {
      return { error: `Video list with ${id} not found` };
    }

    try {
      const deletedVideoList = await prisma.videoList.delete({
        where: {
          id: id,
        },
      });

      console.log('deletedVideoList: ', deletedVideoList);

      return { result: deletedVideoList };
    } catch (error) {
      console.log(`Error deleting video list with id ${id}`);
      return { error: `Error deleting video list with id ${id}` };
    }
  }
}
