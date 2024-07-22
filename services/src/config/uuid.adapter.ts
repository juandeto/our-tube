import { v4 as uuidV4 } from 'uuid';

export class UuidAdapter {
  public static v4() {
    return uuidV4();
  }
}
