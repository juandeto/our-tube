"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVideoListDto = void 0;
class CreateVideoListDto {
    constructor(title, subject) {
        this.title = title;
        this.subject = subject;
    }
    static create(props) {
        const { title, subject } = props;
        if (typeof title !== 'string')
            return ['Title must be a string'];
        if (subject && typeof subject !== 'string')
            return ['Subject must be a string'];
        return [undefined, new CreateVideoListDto(title, subject)];
    }
}
exports.CreateVideoListDto = CreateVideoListDto;
