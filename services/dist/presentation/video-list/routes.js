"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoListRoutes = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
class VideoListRoutes {
    static get routes() {
        const router = (0, express_1.Router)();
        const videoListController = new controller_1.VideoListController();
        router.get('/:id', videoListController.getVideoListById);
        router.get('/', videoListController.getVideoLists);
        router.post('/', videoListController.createVideoList);
        router.put('/:id', videoListController.updateVideoList);
        router.delete('/:id', videoListController.deleteVideoList);
        return router;
    }
}
exports.VideoListRoutes = VideoListRoutes;
