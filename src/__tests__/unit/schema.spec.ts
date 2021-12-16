import Schema from '../../schema';

abstract class TestSchema<Create, Represent> extends Schema<Create, Represent> {
  constructor(data: Create) {
    super(data);
  }

  public get privateFields() {
    return {
      data: this.data,
    };
  }
}

describe('Schema', () => {
  describe('constructor', () => {
    it('should assign the data param', () => {
      // tslint:disable-next-line: max-classes-per-file
      class MySchema extends TestSchema<number, number> {
        constructor(data: number) {
          super(data);
        }
        public get public() {
          return this.data * 2;
        }
      }

      const numberSchema = new MySchema(5);
      expect(numberSchema.privateFields.data).toBe(5);
    });

    it('should get the public representation', () => {
      // tslint:disable-next-line: max-classes-per-file
      class MySchema extends Schema<number, number> {
        constructor(data: number) {
          super(data);
        }
        public get public() {
          return this.data * 2;
        }
      }
      const numberSchema = new MySchema(5);
      expect(numberSchema.public).toBe(10);
    });

    test('a more complicated example', () => {
      interface UserData {
        uid: string;
        fname: string;
        lname: string;
      }

      interface User extends UserData {
        full_name: string;
      }

      // tslint:disable-next-line: max-classes-per-file
      class UserSchema extends Schema<UserData, User> {
        constructor(data: UserData) {
          super(data);
        }

        public get public() {
          return {
            ...this.data,
            full_name: `${this.data.fname} ${this.data.lname}`,
          };
        }
      }

      const user = new UserSchema({
        uid: 'some uid',
        fname: 'bob',
        lname: 'doe',
      });

      expect(user.public).toEqual({
        uid: 'some uid',
        fname: 'bob',
        lname: 'doe',
        full_name: 'bob doe',
      });
    });
  });
});
