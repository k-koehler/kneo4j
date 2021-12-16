import neo4j from '../driver.example';
import UserSchema from '../schemas/user.schema.example';

const userModel = {
  async create(data: {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
  }): Promise<UserSchema | null> {
    return await neo4j.createWithGraphAware('User', data, UserSchema);
  },

  async findByUid(userUid: string) {
    return neo4j
      .read(
        `
          MATCH (user:User {uid:{userUid}})
          RETURN user
        `,
        { userUid },
      )
      .declare<{ user: UserSchema }>({ user: UserSchema })
      .single();
  },
};
export default userModel;
