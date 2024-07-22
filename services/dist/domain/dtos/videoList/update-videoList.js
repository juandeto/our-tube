"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVideoListDto = void 0;
const video_list_models_1 = require("../../../models/video-list.models");
const validators_1 = require("../../../utils/validators");
class UpdateVideoListDto {
    constructor(title, subject, status, date) {
        this.title = title;
        this.subject = subject;
        this.status = status;
        this.date = date;
    }
    get values() {
        const returnObj = {};
        if (this.title)
            returnObj.title = this.title;
        if (this.subject)
            returnObj.subject = this.subject;
        if (this.status)
            returnObj.status = this.status;
        if (this.date)
            returnObj.date = this.date;
        return returnObj;
    }
    static update(props) {
        const { title, status, subject, date } = props;
        let newTitle = title;
        let newStatus = status;
        let newSubject = subject;
        let newDate = date;
        if (newTitle && typeof newTitle !== 'string') {
            return ['Title must be a string'];
        }
        if (newStatus) {
        }
        if (newSubject && typeof newSubject !== 'string') {
            return ['Subject must be a string'];
        }
        if (newDate && !(0, validators_1.isDateValid)(newDate)) {
            return ['Date  sended is not a date'];
        }
        if (newStatus &&
            !Object.values(video_list_models_1.STATUS_LIST).includes(newStatus))
            return ['Invalid status'];
        return [
            undefined,
            new UpdateVideoListDto(newTitle, newSubject, newStatus, newDate),
        ];
    }
}
exports.UpdateVideoListDto = UpdateVideoListDto;
