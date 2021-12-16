import Schema from '../../schema';
import SchemaQuery from '../../schema-query';

class TestSchemaQuery<T> extends SchemaQuery<T> {
  public get privateFields() {
    return {
      schemaMap: this.schemaMap,
      queryResult: this.queryResult,
      cleanup: this.cleanup,
      parser: this.parser,
    };
  }
}

describe('SchemaQuery', () => {
  describe('constructor', () => {
    it('should assign the schemaMap', () => {
      const schemaQuery = new TestSchemaQuery({} as any, () => void 0 as any, {
        // tslint:disable-next-line: max-classes-per-file
        user: class {
          public get foo() {
            return 'foo';
          }
        },
      });
      expect(new schemaQuery.privateFields.schemaMap.user().foo).toBe('foo');
    });

    it('should compose the parser', () => {
      const record = {
        toObject: () => ({
          foo: {
            identity: { high: 0, low: 754 },
            labels: ['Node'],
            properties: {
              foo: { high: 0, low: 1 },
              uid: '37302f70-485b-11ea-b45b-0242ac160003',
            },
          },
        }),
      } as any;
      // tslint:disable-next-line: max-classes-per-file
      class FooSchema extends Schema<
        { foo: string; uid: string },
        { fooBar: string }
      > {
        public get public() {
          return {
            fooBar: `${this.data.foo} ${this.data.uid}`,
          };
        }
      }

      const schemaQuery = new TestSchemaQuery<{ foo: FooSchema }>(
        {} as any,
        () => void 0 as any,
        {
          foo: FooSchema,
        },
      );
      expect(schemaQuery.privateFields.parser(record).foo.public).toEqual({
        fooBar: `1 37302f70-485b-11ea-b45b-0242ac160003`,
      });
    });

    test('user example', () => {
      const record = {
        toObject: () => ({
          user: {
            identity: { high: 0, low: 754 },
            labels: ['Node'],
            properties: {
              fname: 'kev',
              lname: 'koehler',
              uid: '37302f70-485b-11ea-b45b-0242ac160003',
            },
          },
        }),
      } as any;
      // tslint:disable-next-line: max-classes-per-file
      class UserSchema extends Schema<
        { fname: string; lname: string; uid: string },
        { fname: string; lname: string; uid: string; full_name: string }
      > {
        public get public() {
          return {
            ...this.data,
            full_name: `${this.data.fname} ${this.data.lname}`,
          };
        }
      }
      const schemaQuery = new TestSchemaQuery<{ user: UserSchema }>(
        {} as any,
        () => void 0 as any,
        {
          user: UserSchema,
        },
      );
      expect(
        schemaQuery.privateFields.parser(record).user.public.full_name,
      ).toEqual('kev koehler');
    });
  });
});
