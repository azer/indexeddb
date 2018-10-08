import DB from "./src/db";
import Push from "./src/push";
import Pull from "./src/pull";
import * as types from "./src/types";
export default function createDB(name: string, options: types.IDBOptions): DB;
export declare function createTestingDB(options?: types.IDBOptions): DB;
export { Push, Pull };
