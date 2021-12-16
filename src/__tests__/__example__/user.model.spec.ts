import userModel from '../../__example__/models/user.model.example';
import neo4j from '../../__example__/driver.example';

describe('userModelIntegration', () => {
  beforeAll(async done => {
    await neo4j.connect();
    done();
  });

  beforeEach(async done => {
    await neo4j.write('MATCH (n) DETACH DELETE n').run();
    done();
  });

  afterAll(async done => {
    await neo4j.kill();
    done();
  });

  describe('create', () => {
    it('should create the user and return it back', async done => {
      const user = await userModel.create({
        first_name: 'Kevin',
        last_name: 'Koehler',
        username: 'warfare52',
        password: 'hunter2',
      });
      expect(user).not.toBeNull();
      expect(user?.id).toBeDefined();
      expect(user?.public).toEqual({
        name: 'Kevin Koehler',
        username: 'warfare52',
        uid: user?.id,
      });
      done();
    });
  });

  describe('findByUid', () => {
    it('should find the user', async done => {
      const user = await userModel.create({
        first_name: 'Kevin',
        last_name: 'Koehler',
        username: 'warfare52',
        password: 'hunter2',
      });
      const userAgain = await userModel.findByUid(user?.id!);
      expect(user).toBeDefined();
      expect(userAgain).toBeDefined();
      expect(userAgain?.user.public).toEqual(user?.public);
      done();
    });
  });
});
