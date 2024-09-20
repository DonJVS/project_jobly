const { BadRequestError } = require("../expressError");

/** 
 * Generate an SQL query string for partial updates in the database.
 * Useful for dynamically generating SQL update queries where only a subset of fields are being updated in a row. 
 * 
 * @param {Object} dataToUpdate - An object containing the data fields to update and their new value.
 * 
 * @param {Object} jsToSql - A mapping object that translates javascript into SQL.
 * 
 * @returns {Object} - An object containing:
 *                    - setCols: A string representing the SQL "SET" clause for updating the columns with placeholders.
 *                    - values: An array of the values from "dataToUpdate" in the same order as the placeholders. 
 * 
 * @throws {BadRequestError} - Throws if "dataToUpdate" is an empty object.
 * 
 * @example
 * const dataToUpdate = { firstName: 'Aliya', age: 32 };
 * const jsToSql = { firstName: 'first_name' };
 * 
 * const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
 * console.log(result.setCols); // Output: '"first_name"=$1, "age"=$2'
 * console.log(result.values);  // Output: ['Aliya', 32]
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
