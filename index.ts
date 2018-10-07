import DB from "./src/db"
import Store from "./src/store"
import Push from "./src/push"
import Pull from "./src/pull"
import * as types from "./src/types"

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

export { Push, Pull }
