const idb: IDBFactory | null =
  typeof window === "undefined"
    ? self && self.indexedDB
    : (window as any).indexedDB ||
      (window as any).webkitIndexedDB ||
      (window as any).mozIndexedDB ||
      (window as any).OIndexedDB ||
      (window as any).msIndexedDB

import Store from "./store"
import Push from "./push"
import Pull from "./indexeddb-pull"
import { returnResult, createPromise } from "./promises"
import * as types from "./types"

export default class DB implements types.IDB {
  public idb: IDBDatabase | null
  public name: string
  public version: number
  public stores: types.IStore[]
  public push: types.IPush
  public pull: types.IPull
  constructor(name: string, options: types.IDBOptions) {
    this.idb = null
    this.name = name
    this.version = options.version
    this.stores = options.stores || []
    this.push = new Push()
    this.pull = new Pull(this)
  }

  close() {
    this.idb.close()
  }

  delete(): Promise<any> {
    return createPromise(arguments, (callback, resolve, reject) => {
      returnResult(
        null,
        idb.deleteDatabase(this.name),
        callback,
        resolve,
        reject
      )
    })
  }

  onUpgradeNeeded(event: Event) {
    this.stores.forEach(store =>
      store.create((event.target as any).result, event)
    )
  }

  open(callback: (error?: Error, db?: IDBDatabase) => void) {
    const request = idb.open(this.name, this.version)

    request.onupgradeneeded = event => {
      this.onUpgradeNeeded(event)
    }

    request.onsuccess = event => {
      this.idb = request.result
      callback(undefined, this.idb)
    }

    request.onerror = event => {
      callback(
        new Error("Can not open DB. Error: " + JSON.stringify(request.error))
      )
    }

    request.onblocked = event => {
      callback(
        new Error(
          this.name +
            " can not be opened because it's still open somewhere else."
        )
      )
    }
  }

  ready(callback: (error?: Error, db?: IDBDatabase) => void) {
    if (this.idb) return callback()
    this.open(callback)
  }

  store(name: string, options: types.IStoreDefinition) {
    var s = new Store(name, options)
    s.db = this
    this.stores.push(s)
    return s
  }

  sync(target: types.IDB) {
    this.push.hook(target)
    target.push.hook(this)
  }

  transaction(
    storeNames: string[],
    type: IDBTransactionMode,
    callback: (error?: Error, transaction?: IDBTransaction) => void
  ) {
    this.ready(error => {
      if (error) return callback(error)
      callback(undefined, this.idb.transaction(storeNames, type))
    })
  }
}
