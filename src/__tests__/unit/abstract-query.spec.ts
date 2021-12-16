import AbstractQuery from '../../abstract-query';

class TestQuery<T> extends AbstractQuery<T> {
  public get privateMethods() {
    return {
      withCleanup: this.withCleanup.bind(this),
    };
  }

  public get privateFields() {
    return {
      queryResult: this.queryResult,
      cleanup: this.cleanup,
    };
  }
}

describe('AbstractQuery', () => {
  describe('constructor', () => {
    it('should assign the passed params in the constructor', () => {
      async function cleanup() {
        //
      }
      const query = new TestQuery<{}>({ foo: 'bar' } as any, cleanup);
      expect(query.privateFields.cleanup).toEqual(cleanup);
      expect(query.privateFields.queryResult).toEqual({ foo: 'bar' });
    });
  });

  describe('withCleanup', () => {
    it('should invoke cleanup with no err', async done => {
      let numInvocations = 0;
      async function cleanup() {
        ++numInvocations;
      }
      const query = new TestQuery<any>({} as any, cleanup);
      await query.privateMethods.withCleanup(async () => void 0);
      expect(numInvocations).toBe(1);
      done();
    });

    it('should invoke cleanup with err', async done => {
      let numInvocations = 0;
      async function cleanup() {
        ++numInvocations;
      }
      const query = new TestQuery<any>({} as any, cleanup);
      try {
        await query.privateMethods.withCleanup(async () => {
          throw new Error();
        });
        expect(numInvocations).toBe(1);
      } catch {
        //
      }
      done();
    });

    it('should should still throw the error from the cb', async done => {
      async function cleanup() {
        //
      }
      const query = new TestQuery<any>({} as any, cleanup);
      const error = await (async () => {
        try {
          await query.privateMethods.withCleanup(async () => {
            throw new Error();
          });
          return false;
        } catch (e) {
          return true;
        }
      })();
      expect(error).toBe(true);
      done();
    });
  });
});
