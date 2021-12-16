import Neo4J from "../../neo4j";
import Query from "../../query";
import Schema from "../../schema";
import * as neo4j from "neo4j-driver";
import SchemaQuery from "../../schema-query";

describe("Query", () => {
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

  describe("declare", () => {
    it("should return a schema query", async (done) => {
      const driver = neo4j.driver(
        "bolt://localhost",
        neo4j.auth.basic("neo4j", "password123")
      );
      await driver.verifyConnectivity();
      const session = driver.session();
      const result = session.run(
        'CREATE (user:User {fname:"ozzie", lname:"neher", password:"secret"}) RETURN DISTINCT user'
      );
      const query = new Query<{
        user: { fname: string; lname: string; full_name: string };
      }>(result, async () => await session.close()).declare<{
        user: Schema<any, any>;
      }>(
        class Anon extends Schema<{}, {}> {
          public get public() {
            return {};
          }
        }
      );
      expect(query instanceof SchemaQuery).toBe(true);
      await driver.close();
      done();
    });
  });
});
