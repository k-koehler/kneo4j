import * as neo4jDriver from 'neo4j-driver';
import Neo4J, { checkDriver } from '../../neo4j';

class TestNeo4J extends Neo4J {
  public get privateMethods() {
    return {
      exec: this.exec.bind(this),
    };
  }

  public get privateFields() {
    return {
      params: this.params,
      driver: this.driver,
    };
  }
}

describe('Neo4J', () => {
  describe('constructor', () => {
    it('should set the driver to null', async done => {
      const neo4j = new TestNeo4J({
        host: 'some host',
        username: 'some username',
        password: 'some password',
      });
      expect(neo4j.privateFields.driver).toBeNull();
      done();
    });

    it('should set the params to the passed params', async done => {
      const params = {
        host: 'some host',
        username: 'some username',
        password: 'some password',
      };
      const neo4j = new TestNeo4J(params);
      expect(neo4j.privateFields.params).toEqual(params);
      done();
    });
  });

  describe('connect', () => {
    it('should wait to verify connectivity', async done => {
      jest
        .spyOn(neo4jDriver.auth, 'basic')
        .mockImplementationOnce(() => null as any);
      let connectivityInvoked = false;
      jest.spyOn(neo4jDriver, 'driver').mockImplementationOnce(
        () =>
          ({
            async verifyConnectivity() {
              connectivityInvoked = true;
            },
          } as any),
      );
      new Neo4J({
        host: 'some host',
        username: 'some username',
        password: 'some password',
      }).connect();
      expect(connectivityInvoked).toBe(true);
      done();
    });

    it('should throw an error if it fails to verify connectivity', async done => {
      jest
        .spyOn(neo4jDriver.auth, 'basic')
        .mockImplementationOnce(() => null as any);
      jest.spyOn(neo4jDriver, 'driver').mockImplementationOnce(
        () =>
          ({
            async verifyConnectivity() {
              throw new Error('yeet!');
            },
          } as any),
      );
      const error = await (async () => {
        try {
          await new Neo4J({
            host: 'some host',
            username: 'some username',
            password: 'some password',
          }).connect();
          return false;
        } catch {
          return true;
        }
      })();
      expect(error).toBe(true);
      done();
    });
  });

  describe('kill', () => {
    it('should throw an error, not yet connected', async done => {
      const neo4j = new Neo4J({
        host: 'some host',
        username: 'some username',
        password: 'some password',
      });
      const error = await (async () => {
        try {
          await neo4j.kill();
        } catch (e) {
          return true;
        }
        return false;
      })();
      expect(error).toBe(true);
      done();
    });
  });

  describe('exec', () => {
    it('should throw an error, driver not connected', async done => {
      const neo4j = new TestNeo4J({
        host: 'bolt://localhost',
        username: 'neo4j',
        password: 'root',
      });
      const error = await (async () => {
        try {
          await neo4j.privateMethods.exec('RETURN "foo"', {}, 'READ').run();
          return false;
        } catch {
          return true;
        }
      })();
      expect(error).toBe(true);
      done();
    });
  });
});

describe('__test', () => {
  describe('checkDriver', () => {
    it('should throw, is null', () => {
      expect(() => checkDriver(null)).toThrowError();
    });

    it('should not throw, and return true, driver not null', () => {
      expect(checkDriver({} as neo4jDriver.Driver)).toBe(true);
    });
  });
});
