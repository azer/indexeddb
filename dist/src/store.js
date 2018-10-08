"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pubsub = require("pubsub");
const promises_1 = require("./promises");
const __1 = require("../");
const READ_WRITE = "readwrite";
const READ_ONLY = "readonly";
const DEFAULT_KEY = { keyPath: "id", autoIncrement: true };
class Store {
    constructor(name, options) {
        this.name = name;
        this.idbStore = null;
        if (!options) {
            this.isSimpleStore = true;
        }
        else {
            this.key = options.key || DEFAULT_KEY;
            this.indexes = options.indexes || [];
            this.customUpgradeFn = options.upgrade;
            this.isTestStore = !!options.testing;
        }
        this.onChange = pubsub();
    }
    create(db, event) {
        if (db.objectStoreNames.contains(this.name)) {
            return this.upgrade(event);
        }
        if (this.isSimpleStore) {
            this.idbStore = db.createObjectStore(this.name);
            return;
        }
        const key = typeof this.key === "string" ? { keyPath: this.key } : this.key;
        this.idbStore = db.createObjectStore(this.name, key);
        this.indexes.forEach(index => this.createIndex(index));
    }
    createIndex(index) {
        if (typeof index === "string") {
            index = { name: index };
        }
        const field = index.path || index.paths || index.field || index.fields || index.name;
        const options = index.options || { unique: false };
        this.idbStore.createIndex(index.name, field, options);
    }
    upgrade(event) {
        if (!this.customUpgradeFn)
            return;
        const target = event.currentTarget;
        this.idbStore = target.transaction.objectStore(this.name);
        this.customUpgradeFn(this);
    }
    mode(type, callback) {
        return this.db.transaction([this.name], type, (error, tx) => {
            if (error)
                return callback(error);
            callback(undefined, tx.objectStore(this.name));
        });
    }
    readWrite(callback) {
        return this.mode(READ_WRITE, callback);
    }
    readOnly(callback) {
        return this.mode(READ_ONLY, callback);
    }
    all() {
        return promises_1.createPromise(arguments, (callback, resolve, reject) => {
            this.readOnly((error, ro) => {
                promises_1.returnResult(error, ro.openCursor(), callback, resolve, reject);
            });
        });
    }
    add(doc) {
        return promises_1.createPromise(arguments, (callback, resolve, reject) => {
            this._add(doc, callback, resolve, reject, id => {
                this.db.push.publish({
                    action: "add",
                    store: this.name,
                    documentId: id,
                    doc
                }, this.onPublish);
            });
        });
    }
    get(key) {
        return promises_1.createPromise(arguments, (callback, resolve, reject) => {
            this.readOnly((error, ro) => {
                promises_1.returnResult(error, ro.get(key), callback, resolve, reject);
            });
        });
    }
    getByIndex(indexName, indexValue) {
        return promises_1.createPromise(arguments, (callback, resolve, reject) => {
            this.readOnly((error, ro) => {
                promises_1.returnResult(error, ro.index(indexName).get(indexValue), callback, resolve, reject);
            });
        });
    }
    cursor(range, direction, callback) {
        this.readOnly((error, ro) => {
            promises_1.returnResult(error, ro.openCursor(this.range(range), direction), callback);
        });
    }
    indexCursor(name, range, direction, callback) {
        this.readOnly((error, ro) => {
            promises_1.returnResult(error, ro.index(name).openCursor(this.range(range), direction), callback);
        });
    }
    onPublish(errors) {
        if (errors) {
            console.error("Error(s) happened on publishing changes", errors);
        }
    }
    select(indexName, rangeOptions, directionOrCallback, optionalCallback) {
        let range = rangeOptions ? this.range(rangeOptions) : null;
        let direction = directionOrCallback;
        let callback = optionalCallback;
        if (arguments.length === 3 && typeof directionOrCallback === "function") {
            direction = undefined;
            callback = directionOrCallback;
        }
        this.readOnly((error, ro) => {
            promises_1.returnResult(error, ro.index(indexName).openCursor(range, direction), callback);
        });
    }
    update(doc) {
        return promises_1.createPromise(arguments, (callback, resolve, reject) => {
            this._update(doc, callback, resolve, reject, id => {
                this.db.push.publish({
                    action: "update",
                    store: this.name,
                    documentId: id,
                    doc: doc
                }, this.onPublish);
            });
        });
    }
    delete(id) {
        return promises_1.createPromise(arguments, (callback, resolve, reject) => {
            this._delete(id, callback, resolve, reject, () => {
                this.db.push.publish({
                    action: "delete",
                    store: this.name,
                    documentId: id
                }, this.onPublish);
            });
        });
    }
    count() {
        return promises_1.createPromise(arguments, (callback, resolve, reject) => {
            this.readOnly((error, ro) => {
                promises_1.returnResult(error, ro.count(), callback, resolve, reject);
            });
        });
    }
    range(options) {
        if (options.from !== undefined && options.to !== undefined) {
            return IDBKeyRange.bound(options.from, options.to);
        }
        if (options.to !== undefined && options.from === undefined) {
            return IDBKeyRange.upperBound(options.to);
        }
        if (options.from !== undefined) {
            return IDBKeyRange.lowerBound(options.from);
        }
        if (options.only) {
            return IDBKeyRange.only(options.only);
        }
        return options;
    }
    testing(optionalDB) {
        const db = optionalDB || __1.createTestingDB();
        return db.store(this.name, this.isSimpleStore
            ? null
            : {
                key: this.key,
                indexes: this.indexes,
                upgrade: this.customUpgradeFn,
                testing: true
            });
    }
    _add(doc, callback, resolve, reject, push) {
        this.readWrite((error, rw) => {
            promises_1.returnResult(error, rw.add(doc), callback, resolve, reject, push);
            this.onChange.publish();
        });
    }
    _delete(id, callback, resolve, reject, push) {
        this.readWrite((error, rw) => {
            promises_1.returnResult(error, rw.delete(id), callback, resolve, reject, push);
            this.onChange.publish();
        });
    }
    _update(doc, callback, resolve, reject, push) {
        this.readWrite((error, rw) => {
            promises_1.returnResult(error, rw.put(doc), callback, resolve, reject, push);
            this.onChange.publish();
        });
    }
}
exports.default = Store;
