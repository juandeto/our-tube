import { Router } from 'express';
import { VideoListRoutes } from './video-list/routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/api/video-list', VideoListRoutes.routes);

    return router;
  }
}
