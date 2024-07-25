"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoListController = void 0;
const postgres_1 = require("../../data/postgres");
const dtos_1 = require("../../domain/dtos");
const update_videoList_1 = require("../../domain/dtos/videoList/update-videoList");
const video_list_service_1 = require("../services/video-list.service");
class VideoListController {
    constructor(videoListService = new video_list_service_1.VideoListService()) {
        this.videoListService = videoListService;
        this.getVideoLists = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const videoList = yield postgres_1.prisma.videoList.findMany();
            console.log('Searching all VideoList records...', videoList);
            return res.json(videoList);
        });
        this.getVideoListById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = String(req.params.id);
            const { error, result } = yield this.videoListService.getVideoList(id);
            if (!error) {
                return res
                    .status(404)
                    .json({ error: `VideoList with id ${id} not found` });
            }
            console.log(`Getting todo id ${id}`, result);
            return res.json(result);
        });
        this.createVideoList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const [error, createTodoDto] = dtos_1.CreateVideoListDto.create(body);
            if (error || !createTodoDto) {
                return res.status(404).json({ error });
            }
            console.log('Creating new video list: ', createTodoDto.title);
            const { error: errorService, result } = yield this.videoListService.createVideoList(createTodoDto);
            if (error) {
                return res.status(400).json({ errorService });
            }
            return res.status(201).json(result);
        });
        this.updateVideoList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const [error, updateVideoList] = update_videoList_1.UpdateVideoListDto.update(req.body);
            if (error || !updateVideoList) {
                return res.status(404).json({ error });
            }
            const { error: errorService, result } = yield this.videoListService.updateVideoList(id, updateVideoList);
            if (error) {
                return res.status(400).json({ errorService });
            }
            console.log(`Record with id ${id} was updated`);
            return res.json(result);
        });
        this.deleteVideoList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            if (!id) {
                res.json({ error: 'invalid id: ' + id });
            }
            const { error, result } = yield this.videoListService.deleteVideoList(id);
            if (!error) {
                return res
                    .status(404)
                    .json({ error: `Todo with id ${id} was not deleted` });
            }
            console.log(`Record with id ${id} was deleted: `, result);
            return res.json(result);
        });
    }
}
exports.VideoListController = VideoListController;
