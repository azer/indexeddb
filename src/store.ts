import * as pubsub from "pubsub"
import { returnResult, createPromise } from "./promises"
import * as types from "./types"
import { createTestingDB } from "./index"

const READ_WRITE = "readwrite"
const READ_ONLY = "readonly"
const DEFAULT_KEY = { keyPath: "id", autoIncrement: true }

export default class Store implements types.IStore {
  public name: string
  public db: types.IDB
  public idbStore: IDBObjectStore
  public isSimpleStore: boolean
  public key: string | types.IKeyDefinition
  public indexes: types.IIndexDefinition[]
  public isTestStore: boolean
  public onChange: any
  public customUpgradeFn: (store: types.IStore) => void | undefined

  constructor(name: string, options: types.IStoreDefinition) {
    this.name = name
    this.idbStore = null

    if (!options) {
      this.isSimpleStore = true
    } else {
      this.key = options.key || DEFAULT_KEY
      this.indexes = options.indexes || []
      this.customUpgradeFn = options.upgrade
      this.isTestStore = !!options.testing
    }

    this.onChange = pubsub()
  }

  create(db: IDBDatabase, event: Event) {
    if (db.objectStoreNames.contains(this.name)) {
      return this.upgrade(event)
    }

    if (this.isSimpleStore) {
      this.idbStore = db.createObjectStore(this.name)
      return
    }

    const key = typeof this.key === "string" ? { keyPath: this.key } : this.key
    this.idbStore = db.createObjectStore(this.name, key)
    this.indexes.forEach(index => this.createIndex(index))
  }

  createIndex(index: types.IIndexDefinition) {
    if (typeof index === "string") {
      index = { name: index }
    }

    const field =
      index.path || index.paths || index.field || index.fields || index.name
    const options = index.options || { unique: false }

    this.idbStore.createIndex(index.name, field, options)
  }

  upgrade(event: Event) {
    if (!this.customUpgradeFn) return

    const target = event.currentTarget as any

    this.idbStore = (target.transaction as IDBTransaction).objectStore(
      this.name
    )
    this.customUpgradeFn(this)
  }

  mode(type: string, callback: types.ICallback): IDBTransaction {
    return this.db.transaction([this.name], type, (error, tx) => {
      if (error) return callback(error)
      callback(undefined, tx.objectStore(this.name))
    })
  }

  readWrite(callback: types.ICallback): IDBTransaction {
    return this.mode(READ_WRITE, callback)
  }

  readOnly(callback: types.ICallback): IDBTransaction {
    return this.mode(READ_ONLY, callback)
  }

  all(optionalCallback?: types.ICallback): Promise<object> {
    return createPromise(arguments, (callback, resolve, reject) => {
      this.readOnly((error, ro) => {
        returnResult(error, ro.openCursor(), callback, resolve, reject)
      })
    })
  }

  add(doc: object, optionalCallback?: types.ICallback): Promise<object> {
    return createPromise(arguments, (callback, resolve, reject) => {
      this._add(doc, callback, resolve, reject, id => {
        this.db.push.publish(
          {
            action: "add",
            store: this.name,
            documentId: id,
            doc
          },
          this.onPublish
        )
      })
    })
  }

  get(key: any, optionalCallback?: types.ICallback): Promise<object> {
    return createPromise(arguments, (callback, resolve, reject) => {
      this.readOnly((error, ro) => {
        returnResult(error, ro.get(key), callback, resolve, reject)
      })
    })
  }

  getByIndex(
    indexName: any,
    indexValue: any,
    optionalCallback?: types.ICallback
  ) {
    return createPromise(arguments, (callback, resolve, reject) => {
      this.readOnly((error, ro) => {
        returnResult(
          error,
          ro.index(indexName).get(indexValue),
          callback,
          resolve,
          reject
        )
      })
    })
  }

  cursor(range: types.IRange, direction: string, callback: types.ICallback) {
    this.readOnly((error, ro) => {
      returnResult(error, ro.openCursor(this.range(range), direction), callback)
    })
  }

  indexCursor(
    name: string,
    range: types.IRange,
    direction: string,
    callback: types.ICallback
  ) {
    this.readOnly((error, ro) => {
      returnResult(
        error,
        ro.index(name).openCursor(this.range(range), direction),
        callback
      )
    })
  }

  onPublish(errors: Error[]) {
    if (errors) {
      console.error("Error(s) happened on publishing changes", errors)
    }
  }

  select(
    indexName: string,
    rangeOptions: null | types.IRange,
    directionOrCallback: string | types.ICallback,
    optionalCallback?: types.ICallback
  ) {
    let range = rangeOptions ? this.range(rangeOptions) : null
    let direction = directionOrCallback
    let callback = optionalCallback

    if (arguments.length === 3 && typeof directionOrCallback === "function") {
      direction = undefined
      callback = directionOrCallback
    }

    this.readOnly((error, ro) => {
      returnResult(
        error,
        ro.index(indexName).openCursor(range, direction),
        callback
      )
    })
  }

  update(doc: object, optionalCallback?: types.ICallback) {
    return createPromise(arguments, (callback, resolve, reject) => {
      this._update(doc, callback, resolve, reject, id => {
        this.db.push.publish(
          {
            action: "update",
            store: this.name,
            documentId: id,
            doc: doc
          },
          this.onPublish
        )
      })
    })
  }

  delete(id: any, callback?: types.ICallback) {
    return createPromise(arguments, (callback, resolve, reject) => {
      this._delete(id, callback, resolve, reject, () => {
        this.db.push.publish(
          {
            action: "delete",
            store: this.name,
            documentId: id
          },
          this.onPublish
        )
      })
    })
  }

  count(optionalCallback?: types.ICallback): Promise<number> {
    return createPromise(arguments, (callback, resolve, reject) => {
      this.readOnly((error, ro) => {
        returnResult(error, ro.count(), callback, resolve, reject)
      })
    })
  }

  range(options: types.IRange): types.IRange | IDBKeyRange {
    if (options.from !== undefined && options.to !== undefined) {
      return IDBKeyRange.bound(options.from, options.to)
    }

    if (options.to !== undefined && options.from === undefined) {
      return IDBKeyRange.upperBound(options.to)
    }

    if (options.from !== undefined) {
      return IDBKeyRange.lowerBound(options.from)
    }

    if (options.only) {
      return IDBKeyRange.only(options.only)
    }

    return options
  }

  testing(optionalDB?: types.IDB): types.IStore {
    const db = optionalDB || createTestingDB()
    return db.store(
      this.name,
      this.isSimpleStore
        ? null
        : {
            key: this.key,
            indexes: this.indexes,
            upgrade: this.customUpgradeFn,
            testing: true
          }
    )
  }

  _add(
    doc: object,
    callback?: types.ICallback,
    resolve?: types.IResolveFn,
    reject?: types.IRejectFn,
    push?: types.IPushFn
  ) {
    this.readWrite((error, rw) => {
      returnResult(error, rw.add(doc), callback, resolve, reject, push)
      this.onChange.publish()
    })
  }

  _delete(
    id: any,
    callback: types.ICallback,
    resolve: types.IResolveFn,
    reject: types.IRejectFn,
    push: types.IPushFn
  ) {
    this.readWrite((error, rw) => {
      returnResult(error, rw.delete(id), callback, resolve, reject, push)
      this.onChange.publish()
    })
  }

  _update(
    doc: object,
    callback?: types.ICallback,
    resolve?: types.IResolveFn,
    reject?: types.IRejectFn,
    push?: types.IPushFn
  ) {
    this.readWrite((error, rw) => {
      returnResult(error, rw.put(doc), callback, resolve, reject, push)
      this.onChange.publish()
    })
  }
}
