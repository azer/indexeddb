const DB = require("./lib/db");
const Store = require("./lib/store");

module.exports = createDB;

function createDB (name, options) {
  return new DB(name, options)
}
