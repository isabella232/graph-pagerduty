import { reduceGroupById } from '../reduceGroupById';

test("should regroup by inner item's id", () => {
  const users = [
    {
      id: 'U1',
      teams: [{ id: 'T1' }],
    },
  ];

  const result = reduceGroupById(users, 'teams');

  expect(result).toEqual({
    T1: [users[0]],
  });
});

test('should handle grouping single items under multiple ideas', () => {
  const users = [
    {
      id: 'U1',
      teams: [{ id: 'T1' }, { id: 'T2' }],
    },
  ];

  const result = reduceGroupById(users, 'teams');

  expect(result).toEqual({
    T1: [users[0]],
    T2: [users[0]],
  });
});

test('should handle many to many grouping', () => {
  const users = [
    {
      id: 'U1',
      teams: [{ id: 'T1' }, { id: 'T2' }],
    },
    {
      id: 'U2',
      teams: [{ id: 'T2' }, { id: 'T3' }],
    },
  ];

  const result = reduceGroupById(users, 'teams');

  expect(result).toEqual({
    T1: [users[0]],
    T2: [users[0], users[1]],
    T3: [users[1]],
  });
});
