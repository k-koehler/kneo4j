import Schema from '../../schema';

abstract class BaseSchema<T extends { uid: string }, U> extends Schema<T, U> {
  public get id() {
    return this.data.uid;
  }
}
export default BaseSchema;
