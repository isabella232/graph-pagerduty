import { deleteNullProperties } from '../deleteNullProperties';

test.each([null, undefined])(
  'removes %s properties leaving the rest',
  (value) => {
    const result = deleteNullProperties({
      firstName: 'Foo',
      lastName: 'Bar',
      age: value,
      birthday: value,
    });

    expect(result).toEqual({
      firstName: 'Foo',
      lastName: 'Bar',
    });
  },
);

test.each([false, '', 0])(
  'does not remove falsy values that are not null or undefined: %s',
  (value) => {
    const result = deleteNullProperties({
      key: value,
    });

    expect(result).toEqual({
      key: value,
    });
  },
);
