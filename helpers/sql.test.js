const { sqlForPartialUpdate } = require('./sql');
const { BadrequestError } = require('../expressError');

describe('sqlForPartialUpdate', () => {

  test('successfully generates SQL for valid input with jsToSql mapping', () => {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: 'first_name' };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Aliya', 32]
    });
  });

  test('successfully generates SQL for valid input without jsToSql mapping', () => {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = {};

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"firstName"=$1, "age"=$2',
      values: ['Aliya', 32]
    });
  });

  test('successfully generate SQL for one field update', () => {
    const dataToUpdate = { age: 32 };
    const jsToSql = { age: 'age' };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"age"=$1',
      values: [32]
    });
  });

  test('throws BadRequestError if no data is provided', () => {
    const dataToUpdate = {};
    const jsToSql = { firstName: 'first_name' };

    expect(() => {
      sqlForPartialUpdate(dataToUpdate, jsToSql);
    }).toThrow(BadrequestError);
  });

  test('works when jsToSql does not contain a mapping for a field', () => {
    const dataToUpdate = { firstName: 'Aliya', age:32};
    const jsToSql = { age: 'age' }; // no mapping for firstName

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"firstName"=$1, "age"=$2',
      values: ['Aliya', 32]
    });
  });
});