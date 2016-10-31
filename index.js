const DB = require("./lib/db");
const Store = require("./lib/store");

module.exports = createDB;
module.exports.createTestingDB = createTestingDB

function createDB (name, options) {
  return new DB(name, options)
}

function createTestingDB () {
  return new DB(`testing-${Math.floor(Math.random()*9999999)}`, {
    version: 1
  })
}
