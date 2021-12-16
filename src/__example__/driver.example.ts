import Neo4J from '../neo4j';

const neo4j = new Neo4J({
  host: 'bolt://localhost',
  username: 'neo4j',
  password: 'root',
});
export default neo4j;
