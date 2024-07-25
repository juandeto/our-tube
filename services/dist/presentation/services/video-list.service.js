'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.VideoListService = void 0;
const uuid_adapter_1 = require('../../config/uuid.adapter');
const video_list_models_1 = require('../../models/video-list.models');
const postgres_1 = require('../../data/postgres');
const wss_services_1 = require('./wss.services');
class VideoListService {
  constructor(wssService = wss_services_1.WssService.instance) {
    this.wssService = wssService;
    this._videoList = [];
  }
  get activeVideoLists() {
    return this._videoList.filter(
      (vl) => (vl === null || vl === void 0 ? void 0 : vl.status) !== 'DELETED'
    );
  }
  createVideoList(videoList) {
    return __awaiter(this, void 0, void 0, function* () {
      const uuid = uuid_adapter_1.UuidAdapter.v4();
      const { title, subject } = videoList;
      try {
        const createdVideoList = yield postgres_1.prisma.videoList.create({
          data: {
            title: title,
            subject: subject || '',
            id: uuid,
            status: video_list_models_1.STATUS_LIST.PENDING,
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
    });
  }
  getVideoList(id) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const videoList = yield postgres_1.prisma.videoList.findFirst({
          where: {
            id: id,
          },
        });
        if (
          !(videoList === null || videoList === void 0 ? void 0 : videoList.id)
        ) {
          return { error: `Video list with id ${id} not found` };
        }
        return { result: videoList };
      } catch (error) {
        console.log(`Error getting the video list with id ${id}`);
        console.error(error);
        return { error: error };
      }
    });
  }
  updateVideoList(id, updateBody) {
    return __awaiter(this, void 0, void 0, function* () {
      var _a, _b, _c;
      let videoList = this.getVideoList(id);
      if (!videoList) {
        throw new Error('No video list found');
      }
      const { status, title, subject } = updateBody || {};
      const currentList = yield this.getVideoList(id);
      if (
        currentList === null || currentList === void 0
          ? void 0
          : currentList.error
      ) {
        return { error: 'We could not find the list' };
      }
      try {
        const updatedVideoList = yield postgres_1.prisma.videoList.update({
          where: {
            id: id,
          },
          data: {
            status: status
              ? status
              : (_a = currentList.result) === null || _a === void 0
              ? void 0
              : _a.status,
            title: title
              ? title
              : (_b = currentList.result) === null || _b === void 0
              ? void 0
              : _b.title,
            subject: subject
              ? subject
              : (_c = currentList.result) === null || _c === void 0
              ? void 0
              : _c.subject,
          },
        });
        return { result: updatedVideoList };
      } catch (error) {
        console.log(`Error updating video list with id ${id}`);
        return { error: `Error updating video list with id ${id}` };
      }
    });
  }
  deleteVideoList(id) {
    return __awaiter(this, void 0, void 0, function* () {
      const { error: errorGetVideoList } = yield this.getVideoList(id);
      if (!errorGetVideoList) {
        return { error: `Video list with ${id} not found` };
      }
      try {
        const deletedVideoList = yield postgres_1.prisma.videoList.delete({
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
    });
  }
}
exports.VideoListService = VideoListService;
