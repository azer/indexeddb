"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const idb = typeof window === "undefined"
    ? self && self.indexedDB
    : window.indexedDB ||
        window.webkitIndexedDB ||
        window.mozIndexedDB ||
        window.OIndexedDB ||
        window.msIndexedDB;
const store_1 = require("./store");
const push_1 = require("./push");
const indexeddb_pull_1 = require("./indexeddb-pull");
const promises_1 = require("./promises");
class DB {
    constructor(name, options) {
        this.idb = null;
        this.name = name;
        this.version = options.version;
        this.stores = options.stores || [];
        this.push = new push_1.default();
        this.pull = new indexeddb_pull_1.default(this);
    }
    close() {
        this.idb.close();
    }
    delete() {
        return (0, promises_1.createPromise)(arguments, (callback, resolve, reject) => {
            (0, promises_1.returnResult)(null, idb.deleteDatabase(this.name), callback, resolve, reject);
        });
    }
    onUpgradeNeeded(event) {
        this.stores.forEach(store => store.create(event.target.result, event));
    }
    open(callback) {
        const request = idb.open(this.name, this.version);
        request.onupgradeneeded = event => {
            this.onUpgradeNeeded(event);
        };
        request.onsuccess = event => {
            this.idb = request.result;
            callback(undefined, this.idb);
        };
        request.onerror = event => {
            callback(new Error("Can not open DB. Error: " + JSON.stringify(request.error)));
        };
        request.onblocked = event => {
            callback(new Error(this.name +
                " can not be opened because it's still open somewhere else."));
        };
    }
    ready(callback) {
        if (this.idb)
            return callback();
        this.open(callback);
    }
    store(name, options) {
        var s = new store_1.default(name, options);
        s.db = this;
        this.stores.push(s);
        return s;
    }
    sync(target) {
        this.push.hook(target);
        target.push.hook(this);
    }
    transaction(storeNames, type, callback) {
        this.ready(error => {
            if (error)
                return callback(error);
            callback(undefined, this.idb.transaction(storeNames, type));
        });
    }
}
exports.default = DB;
