import Store from "./store";
import * as types from "./types";
export default class DB implements types.IDB {
    idb: IDBDatabase | null;
    name: string;
    version: number;
    stores: types.IStore[];
    push: types.IPush;
    pull: types.IPull;
    constructor(name: string, options: types.IDBOptions);
    close(): void;
    delete(): Promise<any>;
    onUpgradeNeeded(event: Event): void;
    open(callback: (error?: Error, db?: IDBDatabase) => void): void;
    ready(callback: (error?: Error, db?: IDBDatabase) => void): void;
    store(name: string, options: types.IStoreDefinition): Store;
    sync(target: types.IDB): void;
    transaction(storeNames: string[], type: IDBTransactionMode, callback: (error?: Error, transaction?: IDBTransaction) => void): void;
}
