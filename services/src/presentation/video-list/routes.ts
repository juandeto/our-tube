import { Router } from 'express';
import { VideoListController } from './controller';

export class VideoListRoutes {
  static get routes(): Router {
    const router = Router();
    const videoListController = new VideoListController();

    router.get('/:id', videoListController.getVideoListById);
    router.get('/', videoListController.getVideoLists);
    router.post('/', videoListController.createVideoList);
    router.put('/:id', videoListController.updateVideoList);
    router.delete('/:id', videoListController.deleteVideoList);

    return router;
  }
}
