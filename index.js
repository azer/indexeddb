const DB = require("./lib/db");
const Store = require("./lib/store");
const Push = require("./lib/push")
const Pull = require("./lib/pull")

module.exports = createDB;
module.exports.createTestingDB = createTestingDB
module.exports.Push = Push
module.exports.Pull = Pull

function createDB (name, options) {
  return new DB(name, options)
}

function createTestingDB (options) {
  return new DB(`testing-${Math.floor(Math.random()*9999999)}`, options || {
    version: 1
  })
}
