import { Result, Record } from 'neo4j-driver';
import parser from './parser';

abstract class AbstractQuery<T> {
  protected readonly queryResult: Result;
  protected readonly cleanup: () => Promise<void>;
  protected parser: (record: Record) => T;

  constructor(queryResult: Result, cleanup: () => Promise<void>) {
    this.queryResult = queryResult;
    this.cleanup = cleanup;
    this.parser = parser.parseRecord;
  }

  protected async withCleanup<U>(callback: () => Promise<U>) {
    try {
      return await callback();
    } finally {
      await this.cleanup();
    }
  }

  public async run(): Promise<void> {
    await this.withCleanup(
      async () =>
        await new Promise<T[]>((resolve, reject) =>
          this.queryResult.subscribe({
            onCompleted: () => resolve(void 0),
            onError: error => reject(error),
          }),
        ),
    );
  }

  public async all(): Promise<T[]> {
    return await this.withCleanup(async () => {
      const result: T[] = [];
      return await new Promise<T[]>((resolve, reject) =>
        this.queryResult.subscribe({
          onNext: record => result.push(this.parser(record)),
          onCompleted: () => void resolve(result),
          onError: error => reject(error),
        }),
      );
    });
  }

  public async single(): Promise<T | null> {
    return await this.withCleanup(
      async () =>
        await new Promise<T | null>((resolve, reject) =>
          this.queryResult.subscribe({
            onNext: record => resolve(this.parser(record)),
            onCompleted: () => resolve(null),
            onError: error => reject(error),
          }),
        ),
    );
  }

  public async forEach(callback: (t: T) => any): Promise<void> {
    return await this.withCleanup(async () => {
      return await new Promise<void>((resolve, reject) =>
        this.queryResult.subscribe({
          onNext: record => callback(this.parser(record)),
          onCompleted: () => resolve(),
          onError: error => reject(error),
        }),
      );
    });
  }
}
export default AbstractQuery;
