import { Record } from 'neo4j-driver';
import parser from '../../parser';

describe('parser', () => {
  describe('parseRecord', () => {
    it('should parse a basic record with a name', () => {
      expect(
        parser.parseRecord({
          toObject: () => ({
            n: {
              identity: { high: 0, low: 754 },
              labels: ['Node'],
              properties: {
                foo: { high: 0, low: 1 },
                uid: '37302f70-485b-11ea-b45b-0242ac160003',
              },
            },
          }),
        } as any),
      ).toEqual({
        n: {
          foo: 1,
          uid: '37302f70-485b-11ea-b45b-0242ac160003',
        },
      });
    });
  });

  // TODO more tests
});
