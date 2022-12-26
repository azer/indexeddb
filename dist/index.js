"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestingDB = exports.types = exports.IndexedDBPull = exports.Pull = exports.Push = void 0;
const db_1 = require("./db");
const push_1 = require("./push");
exports.Push = push_1.default;
const pull_1 = require("./pull");
exports.Pull = pull_1.default;
const indexeddb_pull_1 = require("./indexeddb-pull");
exports.IndexedDBPull = indexeddb_pull_1.default;
const types = require("./types");
exports.types = types;
__exportStar(require("./types"), exports);
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
