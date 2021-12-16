import * as neo4j from "neo4j-driver";
import Neo4J from "../../neo4j";
import Schema from "../../schema";
import SchemaQuery from "../../schema-query";

describe("SchemaQuery", () => {
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

  describe("User", () => {
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
      const driver = neo4j.driver(
        "bolt://localhost",
        neo4j.auth.basic("neo4j", "password123")
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run(
        'CREATE (user:User {fname:"ozzie", lname:"neher", password:"secret"}) RETURN DISTINCT user'
      );
      const [user] = await new SchemaQuery<{ user: UserSchema }>(
        result,
        async () => await session.close(),
        { user: UserSchema }
      ).all();
      expect(user.user.public.full_name).toEqual("ozzie neher");
      await driver.close();
      done();
    });
  });
});
