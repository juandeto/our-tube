import { STATUS_LIST } from '../../../models/video-list.models';
import { isDateValid } from '../../../utils/validators';
import type { STATUS_TYPE } from '../../../models/video-list.models';

export class UpdateVideoListDto {
  private constructor(
    public readonly title?: string,
    public readonly subject?: string,
    public readonly status?: STATUS_TYPE,
    public readonly date?: Date
  ) {}

  get values() {
    const returnObj: { [key: string]: any } = {};

    if (this.title) returnObj.title = this.title;
    if (this.subject) returnObj.subject = this.subject;
    if (this.status) returnObj.status = this.status;
    if (this.date) returnObj.date = this.date;

    return returnObj;
  }

  static update(props: { [key: string]: any }): [string?, UpdateVideoListDto?] {
    const { title, status, subject, date } = props;

    let newTitle = title;
    let newStatus = status;
    let newSubject = subject;
    let newDate = date;

    if (newTitle && typeof newTitle !== 'string') {
      return ['Title must be a string'];
    }

    if (newSubject && typeof newSubject !== 'string') {
      return ['Subject must be a string'];
    }

    if (newDate && !isDateValid(newDate)) {
      return ['Date  sended is not a date'];
    }

    if (
      newStatus &&
      !Object.values(STATUS_LIST).includes(newStatus as STATUS_TYPE)
    )
      return ['Invalid status'];

    return [
      undefined,
      new UpdateVideoListDto(newTitle, newSubject, newStatus, newDate),
    ];
  }
}
