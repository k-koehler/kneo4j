import Query from '../../query';
import SchemaQuery from '../../schema-query';

describe('Query', () => {
  describe('declare', () => {
    it('should return instanceof SchemaQuery', () => {
      expect(
        new Query({} as any, async () => void 0).declare({}) instanceof
          SchemaQuery,
      ).toBe(true);
    });
  });
});
