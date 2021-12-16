import companyModel from '../../__example__/models/company.model.example';
import userModel from '../../__example__/models/user.model.example';
import neo4j from '../../__example__/driver.example';

describe('companyModelIntegration', () => {
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
      const company = await companyModel.create({
        name: 'Kevin',
        plan: 'freemium',
      });
      expect(company).not.toBeNull();
      expect(company?.data.uid).toBeDefined();
      expect(company?.public).toEqual({
        name: 'Kevin',
        is_freemium: true,
        uid: company?.id,
      });
      done();
    });
  });

  describe('findByUid', () => {
    it('should find the user', async done => {
      const company = await companyModel.create({
        name: 'Kevin',
        plan: 'freemium',
      });
      const companyAgain = await companyModel.findByUid(company?.id!);
      expect(company).toBeDefined();
      expect(companyAgain).toBeDefined();
      expect(companyAgain?.company.public).toEqual(company?.public);
      done();
    });
  });

  describe('attachUser & users', () => {
    it('should attach the user and return it back', async done => {
      const company = await companyModel.create({
        name: 'Kevin',
        plan: 'freemium',
      });
      const user = await userModel.create({
        first_name: 'Kevin',
        last_name: 'Koehler',
        username: 'warfare52',
        password: 'hunter2',
      });
      expect(await companyModel.users(company?.id!)).toHaveLength(0);
      await companyModel.attachUser(company?.id!, user?.id!);
      const users = await companyModel.users(company?.id!);
      expect(users).toHaveLength(1);
      for (const { user: usr } of users) {
        expect(usr.public.name).toBe('Kevin Koehler');
      }
      done();
    });
  });
});
