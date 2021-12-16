import { Result, Record } from 'neo4j-driver';
import AbstractQuery from './abstract-query';

function composeParser<T>(
  recordParser: (record: Record) => any,
  schemaMap: any,
): (record: Record) => any {
  return record => {
    const parsed = recordParser(record);
    for (const [key, value] of Object.entries<any>(schemaMap)) {
      if (parsed[key]) {
        parsed[key] = new value(parsed[key]);
      }
    }
    return parsed as T;
  };
}

class SchemaQuery<T> extends AbstractQuery<T> {
  protected schemaMap: any;

  constructor(
    queryResult: Result,
    cleanup: () => Promise<void>,
    schemaMap: any,
  ) {
    super(queryResult, cleanup);
    this.schemaMap = schemaMap;
    this.parser = composeParser<T>(this.parser, schemaMap);
  }
}
export default SchemaQuery;
