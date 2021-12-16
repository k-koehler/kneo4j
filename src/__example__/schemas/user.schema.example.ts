import BaseSchema from './base.schema.example';

interface RawUser {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  uid: string;
}

interface User {
  name: string;
  username: string;
  uid: string;
}

export default class UserSchema extends BaseSchema<RawUser, User> {
  public get public() {
    const { first_name, last_name, username, uid } = this.data;
    return {
      name: `${first_name} ${last_name}`,
      username,
      uid,
    };
  }
}
