import Pull from "./pull";
import * as types from "./types";
export default class IndexedDBPull extends Pull implements types.IIndexedDBPull {
    db: types.IDB;
    private _stores;
    constructor(db: types.IDB);
    stores(): types.IStoreMap;
    receive(updates: types.IUpdate[] | types.IUpdate, callback: types.ICallback): void;
    copyUpdate(update: types.IUpdate, callback: types.ICallback): void;
}
