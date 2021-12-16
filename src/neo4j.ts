import * as neo4j from 'neo4j-driver';
import Query from './query';

interface Neo4jParams {
  host: string;
  username: string;
  password: string;
  maxConnectionTimeMs?: number;
}

export function checkDriver(
  driver: neo4j.Driver | null,
): driver is neo4j.Driver | never {
  if (driver === null) {
    throw new Error(
      "Not connected yet. Did you forget to invoke the 'connect' method?",
    );
  }
  return true;
}

class Neo4J {
  protected readonly params: Neo4jParams;
  protected driver: neo4j.Driver | null;
  protected connected: boolean;

  protected exec<T>(
    cypher: string,
    params: any,
    mode: neo4j.SessionMode,
  ): Query<T> {
    if (checkDriver(this.driver)) {
      const session = this.driver.session({ defaultAccessMode: mode });
      return new Query<T>(session.run(cypher, params), async () =>
        session.close(),
      );
    }
    // impossible
    return {} as Query<T>;
  }

  /**
   * creates a new instance neo4j
   * (creating a new instance does not connect to the host, to do this you must invoke "connect")
   */
  constructor(params: Neo4jParams) {
    this.params = params;
    this.driver = null;
    this.connected = false;
  }

  /**
   * connects to the database
   */
  public async connect(): Promise<Neo4J> {
    if (this.connected) {
      return this;
    }
    this.driver = neo4j.driver(
      this.params.host,
      neo4j.auth.basic(this.params.username, this.params.password),
    );
    await this.driver.verifyConnectivity();
    this.connected = true;
    return this;
  }

  /**
   * kill the connection
   */
  public async kill(): Promise<void> {
    if (checkDriver(this.driver)) {
      await this.driver.close();
      this.connected = false;
    }
  }

  /**
   * read from the database
   */
  public read<T>(cypher: string, params: any = {}) {
    return this.exec<T>(cypher, params, 'READ');
  }

  /**
   * write to the database
   */
  public write<T>(cypher: string, params: any = {}) {
    return this.exec<T>(cypher, params, 'WRITE');
  }

  /**
   * create a node with a GraphAware uuid
   */
  public async createWithGraphAware<T>(label: string, data: any, schema?: any) {
    const createResult = await this.write<{ node_id: number }>(
      `
        CREATE (node:${label} {data})
        RETURN id(node) as node_id
      `,
      { data },
    ).single();
    if (createResult === null) {
      throw new Error('An unknown error occurred creating the node');
    }
    const { node_id } = createResult;
    const query: any = this.read<{ node: T }>(
      `
        MATCH (node:${label})
        WHERE id(node) = toInt({node_id})
        RETURN node
      `,
      { node_id },
    );
    const modifiedQuery = schema ? query.declare({ node: schema }) : query;
    const matchResult = await modifiedQuery.single();
    if (matchResult === null) {
      throw new Error('An unknown error occurred creating the node');
    }
    return matchResult.node;
  }
}

export default Neo4J;
