import Neo4J from "../../neo4j";
import Schema from "../../schema";

describe("Neo4J", () => {
  describe("connect", () => {
    it("should throw an error if the connection fails", async (done) => {
      const neo4j = new Neo4J({
        host: "bolt://some_url",
        username: "some username",
        password: "some password",
      });
      const error = await (async () => {
        try {
          await neo4j.connect();
          return false;
        } catch {
          return true;
        }
      })();
      expect(error).toBe(true);
      await neo4j.kill();
      done();
    });

    it("should connect", async (done) => {
      const neo4j = new Neo4J({
        host: "bolt://localhost",
        username: "neo4j",
        password: "password123",
      });
      await neo4j.connect();
      await neo4j.kill();
      done();
    });
  });

  describe("kill", () => {
    it("should destroy the driver", async (done) => {
      const neo4j = new Neo4J({
        host: "bolt://localhost",
        username: "neo4j",
        password: "password123",
      });
      await neo4j.connect();
      await neo4j.kill();
      done();
    });
  });

  describe("read & write", () => {
    const db = new Neo4J({
      host: "bolt://localhost",
      username: "neo4j",
      password: "password123",
    });

    beforeAll(async (done) => {
      await db.connect();
      done();
    });

    beforeEach(async (done) => {
      await db.write("MATCH (n) DETACH DELETE n").run();
      done();
    });

    afterAll(async (done) => {
      await db.kill();
      done();
    });

    it("should create a node and return it back", async (done) => {
      expect(
        await db.read<{ uid: string }>("MATCH (n) RETURN n.uid as uid").all()
      ).toHaveLength(0);
      await db.write<void>("CREATE (node:Node) RETURN node").run();
      expect(
        await db.read<{ uid: string }>("MATCH (n) RETURN n.uid as uid").all()
      ).toHaveLength(1);
      done();
    });

    it("should read a basic node", async (done) => {
      await db.write<void>('CREATE (node:Node {foo: "bar"}) RETURN node').run();
      const [res] = await db
        .read<{ n: { foo: string } }>("MATCH (n) RETURN n")
        .all();
      expect(res.n.foo).toBe("bar");
      done();
    });

    it("should read a basic node with an int", async (done) => {
      await db.write<void>("CREATE (node:Node {foo: 1}) RETURN node").run();
      const [res] = await db
        .read<{ n: { foo: string } }>("MATCH (n) RETURN n")
        .all();
      expect(res.n.foo).toBe(1);
      done();
    });

    it("should read a basic node with a collect of some other nodes", async (done) => {
      await db
        .write<void>(
          `
            CREATE (node:Node {node_value:1})
            CREATE (other_node:OtherNode {node_value:2})
          `
        )
        .run();
      const res = await db
        .read<{
          node: { node_value: string };
          collected: { node_value: number }[];
        }>(
          `
            MATCH (node:Node)
            MATCH (other_node:OtherNode) 
            RETURN node, collect(other_node) as collected
          `
        )
        .all();
      expect(res).toHaveLength(1);
      expect(res[0].collected).toHaveLength(1);
      expect(res[0].collected[0].node_value).toBe(2);
      done();
    });

    it("should read an optional match null", async (done) => {
      await db
        .write<void>(
          `
            CREATE (node:Node {node_value: 10})
          `
        )
        .run();
      const res = await db
        .read<{
          node: { node_value: string };
          other_node: { node_value: number } | null;
        }>(
          `
            MATCH (node:Node)
            OPTIONAL MATCH (other_node:OtherNode) 
            RETURN node, other_node
          `
        )
        .all();
      const [{ node, other_node }] = res;
      expect(node.node_value).toBe(10);
      expect(other_node).toBeNull();
      done();
    });

    it("should get a map", async (done) => {
      await db
        .write<void>(
          `
            CREATE (node:Node {node_value: 10})
          `
        )
        .run();
      const res = await db
        .read<{
          node: { node_value: string; foo: string };
        }>(
          `
            MATCH (node:Node)
            RETURN node{.*, foo:"bar"} as node
          `
        )
        .single();
      const { node } = res!;
      expect(node.node_value).toBe(10);
      expect(node.foo).toBe("bar");
      done();
    });

    it("should allow arbitrary callback in forEach method", async (done) => {
      let sum = 0;
      await db
        .read<{ num: number }>(
          `
            UNWIND range(0,100) as num
            RETURN num
          `
        )
        .forEach(({ num }) => (sum += num));
      expect(sum).toBe(
        (() => {
          let comparatorSum = 0;
          for (let i = 0; i < 100; comparatorSum += ++i) {
            //
          }
          return comparatorSum;
        })()
      );
      done();
    });
  });

  describe("User", () => {
    const db = new Neo4J({
      host: "bolt://localhost",
      username: "neo4j",
      password: "password123",
    });

    beforeAll(async (done) => {
      await db.connect();
      done();
    });

    beforeEach(async (done) => {
      await db.write("MATCH (n) DETACH DELETE n").run();
      done();
    });

    afterAll(async (done) => {
      await db.kill();
      done();
    });

    interface DbUser {
      uid: string;
      fname: string;
      lname: string;
      password: string;
    }

    interface User extends Omit<DbUser, "password"> {
      full_name: string;
    }

    class UserSchema extends Schema<DbUser, User> {
      public get public(): User {
        const { password: _, ...userData } = this.data;
        return {
          ...userData,
          full_name: `${userData.fname} ${userData.lname}`,
        };
      }
    }

    it("should get the users full_name", async (done) => {
      const { user } = (await db
        .write<{ user: DbUser }>(
          'CREATE (user:User {fname:"ozzie", lname:"neher", password:"secret"}) RETURN DISTINCT user'
        )
        .declare<{ user: UserSchema }>({ user: UserSchema })
        .single())!;
      expect(user.public.full_name).toEqual("ozzie neher");
      done();
    });
  });
});
