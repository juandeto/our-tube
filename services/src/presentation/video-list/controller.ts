import { Request, Response } from 'express';
import { prisma } from '../../data/postgres';
import { CreateVideoListDto } from '../../domain/dtos';
import { UpdateVideoListDto } from '../../domain/dtos/videoList/update-videoList';
import { VideoListService } from '../services/video-list.service';

export class VideoListController {
  constructor(private readonly videoListService = new VideoListService()) {}

  public getVideoLists = async (req: Request, res: Response) => {
    const videoList = await prisma.videoList.findMany();

    console.log('Searching all VideoList records...', videoList);

    return res.json(videoList);
  };

  public getVideoListById = async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const { error, result } = await this.videoListService.getVideoList(id);

    if (!error) {
      return res
        .status(404)
        .json({ error: `VideoList with id ${id} not found` });
    }

    console.log(`Getting todo id ${id}`, result);

    return res.json(result);
  };

  public createVideoList = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, createTodoDto] = CreateVideoListDto.create(body);

    if (error || !createTodoDto) {
      return res.status(404).json({ error });
    }

    console.log('Creating new video list: ', createTodoDto.title);

    const { error: errorService, result } =
      await this.videoListService.createVideoList(createTodoDto);

    if (error) {
      return res.status(400).json({ errorService });
    }

    return res.status(201).json(result);
  };

  public updateVideoList = async (req: Request, res: Response) => {
    const id = req.params.id;

    const [error, updateVideoList] = UpdateVideoListDto.update(req.body);

    if (error || !updateVideoList) {
      return res.status(404).json({ error });
    }

    const { error: errorService, result } =
      await this.videoListService.updateVideoList(id, updateVideoList);

    if (error) {
      return res.status(400).json({ errorService });
    }

    console.log(`Record with id ${id} was updated`);

    return res.json(result);
  };

  public deleteVideoList = async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id) {
      res.json({ error: 'invalid id: ' + id });
    }

    const { error, result } = await this.videoListService.deleteVideoList(id);

    if (!error) {
      return res
        .status(404)
        .json({ error: `Todo with id ${id} was not deleted` });
    }

    console.log(`Record with id ${id} was deleted: `, result);

    return res.json(result);
  };
}
