import DB from "./db";
import Push from "./push";
import Pull from "./pull";
import IndexedDBPull from "./indexeddb-pull";
import * as types from "./types";
export default function createDB(name: string, options: types.IDBOptions): DB;
export declare function createTestingDB(options?: types.IDBOptions): DB;
export { Push, Pull, IndexedDBPull };
