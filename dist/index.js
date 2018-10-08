"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const push_1 = require("./push");
exports.Push = push_1.default;
const pull_1 = require("./pull");
exports.Pull = pull_1.default;
const indexeddb_pull_1 = require("./indexeddb-pull");
exports.IndexedDBPull = indexeddb_pull_1.default;
const types = require("./types");
exports.types = types;
function createDB(name, options) {
    return new db_1.default(name, options);
}
exports.default = createDB;
function createTestingDB(options) {
    return new db_1.default(`testing-${Math.floor(Math.random() * 9999999)}`, options || {
        version: 1
    });
}
exports.createTestingDB = createTestingDB;
