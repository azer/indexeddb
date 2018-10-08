"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pull_1 = require("./pull");
class IndexedDBPull extends pull_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    stores() {
        if (this._stores)
            return this._stores;
        this._stores = {};
        var i = this.db.stores.length;
        while (i--) {
            this._stores[this.db.stores[i].name] = this.db.stores[i];
        }
        return this._stores;
    }
    receive(updates, callback) {
        if (!Array.isArray(updates)) {
            return this.copyUpdate(updates, callback);
        }
        const self = this;
        next(0);
        function next(i) {
            if (i >= updates.length)
                return callback && callback();
            self.copyUpdate(updates[i], err => {
                if (err)
                    return callback(err);
                next(i + 1);
            });
        }
    }
    copyUpdate(update, callback) {
        const stores = this.stores();
        const store = stores[update.store];
        if (!store)
            return callback(new Error("Unknown store: " + update.store));
        if (update.action === "add") {
            update.doc.id = update.documentId;
            store._add(update.doc, callback);
            return;
        }
        if (update.action === "update") {
            store._update(update.doc, callback);
            return;
        }
        if (update.action === "delete") {
            store._delete(update.documentId, callback);
            return;
        }
    }
}
exports.default = IndexedDBPull;
