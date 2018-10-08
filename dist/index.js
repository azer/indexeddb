"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./src/db");
const push_1 = require("./src/push");
exports.Push = push_1.default;
const pull_1 = require("./src/pull");
exports.Pull = pull_1.default;
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
