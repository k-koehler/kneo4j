import * as neo4j from 'neo4j-driver';
import AbstractQuery from '../../abstract-query';
import Neo4J from '../../neo4j';

class TestQuery<T> extends AbstractQuery<T> {}

describe('AbstractQuery', () => {
  const db = new Neo4J({
    host: 'bolt://localhost',
    username: 'neo4j',
    password: 'root',
  });

  beforeAll(async done => {
    await db.connect();
    done();
  });

  beforeEach(async done => {
    await db.write('MATCH (n) DETACH DELETE n').run();
    done();
  });

  afterAll(async done => {
    await db.kill();
    done();
  });

  describe('run', () => {
    it('should run the query without a return without throwing error', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('CREATE (node:Node)');
      await new TestQuery(result, async () => await session.close()).run();
      await driver.close();
      done();
    });

    it('should run a query which returns many things without throwing error', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('UNWIND range(0,100) as num RETURN num');
      await new TestQuery(result, async () => await session.close()).run();
      await driver.close();
      done();
    });

    it('should create a node', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      {
        const session = driver.session();
        const result = session.run('CREATE (node:Node)');
        await new TestQuery(result, async () => await session.close()).run();
      }
      {
        const session = driver.session();
        const result = session.run('MATCH (node:Node) RETURN node');
        expect(
          await new TestQuery(result, async () => await session.close()).all(),
        ).toHaveLength(1);
      }
      await driver.close();
      done();
    });

    it('should throw an error', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('sfdsdfsdf');
      const error = await (async () => {
        try {
          await new TestQuery(result, async () => await session.close()).run();
          return false;
        } catch (e) {
          return true;
        }
      })();
      expect(error).toBe(true);
      await driver.close();
      done();
    });

    it('should close the session', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('CREATE (node:Node)');
      await new TestQuery(result, async () => await session.close()).run();
      const error = await (async () => {
        try {
          await session.run('MATCH (n) RETURN n');
          return null;
        } catch (e) {
          return e.toString();
        }
      })();
      expect(error).toBe('Neo4jError: Cannot run query in a closed session.');
      await driver.close();
      done();
    });
  });

  describe('all', () => {
    it('should return all the results', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('UNWIND range(0,99) as num RETURN num');
      const nums = await new TestQuery<{ num: number }>(
        result,
        async () => await session.close(),
      ).all();
      expect(nums).toHaveLength(100);
      let i = 0;
      for (const { num } of nums) {
        expect(num).toBe(i++);
      }
      await driver.close();
      done();
    });

    it('should throw an error', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('sfdsdfsdf');
      const error = await (async () => {
        try {
          await new TestQuery(result, async () => await session.close()).all();
          return false;
        } catch (e) {
          return true;
        }
      })();
      expect(error).toBe(true);
      await driver.close();
      done();
    });

    it('should close the session', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('CREATE (node:Node)');
      await new TestQuery(result, async () => await session.close()).all();
      const error = await (async () => {
        try {
          await session.run('MATCH (n) RETURN n');
          return null;
        } catch (e) {
          return e.toString();
        }
      })();
      expect(error).toBe('Neo4jError: Cannot run query in a closed session.');
      await driver.close();
      done();
    });
  });

  describe('single', () => {
    it('should return one result', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('RETURN "foo" as foo');
      const { foo } = (await new TestQuery<{ foo: string }>(
        result,
        async () => await session.close(),
      ).single())!;
      expect(foo).toBe('foo');
      await driver.close();
      done();
    });

    it('should return one result of many', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('UNWIND range(0,100) AS foo RETURN foo');
      const { foo } = (await new TestQuery<{ foo: number }>(
        result,
        async () => await session.close(),
      ).single())!;
      expect(foo).toBe(0);
      await driver.close();
      done();
    });

    it('should return null, no result', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('MATCH (node:Node) RETURN node');
      const res = await new TestQuery<{ foo: number }>(
        result,
        async () => await session.close(),
      ).single();
      expect(res).toBe(null);
      await driver.close();
      done();
    });

    it('should throw an error', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('sfdsdfsdf');
      const error = await (async () => {
        try {
          await new TestQuery(
            result,
            async () => await session.close(),
          ).single();
          return false;
        } catch (e) {
          return true;
        }
      })();
      expect(error).toBe(true);
      await driver.close();
      done();
    });

    it('should close the session', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('CREATE (node:Node)');
      await new TestQuery(result, async () => await session.close()).single();
      const error = await (async () => {
        try {
          await session.run('MATCH (n) RETURN n');
          return null;
        } catch (e) {
          return e.toString();
        }
      })();
      expect(error).toBe('Neo4jError: Cannot run query in a closed session.');
      await driver.close();
      done();
    });
  });

  describe('forEach', () => {
    it('multiply each result by two', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('UNWIND range(0,99) as num RETURN num');
      const nums: { multipliedNumber: number }[] = [];
      await new TestQuery<{ num: number }>(
        result,
        async () => await session.close(),
      ).forEach(({ num }) => nums.push({ multipliedNumber: num * 2 }));
      expect(nums).toHaveLength(100);
      let i = 0;
      for (const { multipliedNumber } of nums) {
        expect(multipliedNumber).toBe(i++ * 2);
      }
      await driver.close();
      done();
    });

    function identity(x: any) {
      return x;
    }

    it('should throw an error', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('sfdsdfsdf');
      const error = await (async () => {
        try {
          await new TestQuery(
            result,
            async () => await session.close(),
          ).forEach(identity);
          return false;
        } catch (e) {
          return true;
        }
      })();
      expect(error).toBe(true);
      await driver.close();
      done();
    });

    it('should close the session', async done => {
      const driver = neo4j.driver(
        'bolt://localhost',
        neo4j.auth.basic('neo4j', 'root'),
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run('CREATE (node:Node)');
      await new TestQuery(result, async () => await session.close()).forEach(
        identity,
      );
      const error = await (async () => {
        try {
          await session.run('MATCH (n) RETURN n');
          return null;
        } catch (e) {
          return e.toString();
        }
      })();
      expect(error).toBe('Neo4jError: Cannot run query in a closed session.');
      await driver.close();
      done();
    });
  });
});
