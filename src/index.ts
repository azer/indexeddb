import DB from "./db"
import Store from "./store"
import Push from "./push"
import Pull from "./pull"
import IndexedDBPull from "./indexeddb-pull"
import * as types from "./types"

export default function createDB(name: string, options: types.IDBOptions) {
  return new DB(name, options)
}

export function createTestingDB(options?: types.IDBOptions) {
  return new DB(
    `testing-${Math.floor(Math.random() * 9999999)}`,
    options || {
      version: 1
    }
  )
}

export { Push, Pull, IndexedDBPull }
