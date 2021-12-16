import { Result, Record } from 'neo4j-driver';
import AbstractQuery from './abstract-query';
import SchemaQuery from './schema-query';

class Query<T> extends AbstractQuery<T> {
  constructor(queryResult: Result, cleanup: () => Promise<void>) {
    super(queryResult, cleanup);
  }

  public declare<U>(schemaMap: any): SchemaQuery<U> {
    return new SchemaQuery<U>(this.queryResult, this.cleanup, schemaMap);
  }
}
export default Query;
