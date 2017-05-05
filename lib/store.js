"use strict"

const READ_WRITE = 'readwrite'
const READ_ONLY = 'readonly'
const DEFAULT_KEY = { keyPath: 'id', autoIncrement: true }

let createTestingDB

class Store {
  constructor (name, options) {
    this.name = name
    this.idbStore = null

    if (!options) {
      this.isSimpleStore = true
    } else {
      this.key = options.key || DEFAULT_KEY
      this.indexes = options.indexes || []
      this._upgrade = options.upgrade
      this.isTestStore = !!options.testing
    }
  }

  create (db, event) {
    if (db.objectStoreNames.contains(this.name)) {
      return this.upgrade(event)
    }

    if (this.isSimpleStore) {
      this.idbStore = db.createObjectStore(this.name)
      return
    }

    const key = typeof this.key === 'string' ? { 'keyPath': this.key } : this.key
    this.idbStore = db.createObjectStore(this.name, key)
    this.indexes.forEach(index => this.createIndex(index))
  }


  createIndex (index) {
    if (typeof index === 'string') {
      index = { name: index }
    }

    const field = index.path || index.paths || index.field || index.fields || index.name
    const options  = index.options || { unique: false }

    this.idbStore.createIndex(index.name, field, index.options)
  }

  upgrade (event) {
    if (!this._upgrade) return

    this.idbStore = event.currentTarget.transaction.objectStore(this.name)
    this._upgrade(this)
  }

  mode (type, callback) {
    return this.db.transaction([this.name], type, (error, tx) => {
      if (error) return callback(error)
      callback(undefined, tx.objectStore(this.name))
    })
  }

  readWrite (callback) {
    return this.mode(READ_WRITE, callback)
  }

  readOnly (callback) {
    return this.mode(READ_ONLY, callback)
  }

  all (callback) {
    this.readOnly((error, ro) => {
      if (error) return callback(error)
      returnResult(ro.openCursor(), callback)
    })
  }

  add (doc) {
    return createPromise(arguments, (callback, resolve, reject) => {
      this._add(doc, callback, resolve, reject, id => {
        this.db.push.add({
          action: 'add',
          store: this.name,
          id: id,
          doc: doc
        })
      })
    })
  }

  _add (doc, callback, resolve, reject, push) {
    this.readWrite((error, rw) => {
      if (error) return callback(error)
      returnResult(rw.add(doc), callback, resolve, reject, push)
    })
  }

  get (key) {
    return createPromise(arguments, (callback, resolve, reject) => {
      this.readOnly((error, ro) => {
        if (error) return callback(error)
        returnResult(ro.get(key), callback)
      })
    })
  }

  getByIndex (indexName, indexValue) {
     return createPromise(arguments, (callback, resolve, reject) => {
      this.readOnly((error, ro) => {
        if (error) return callback(error)
        returnResult(ro.index(indexName).get(indexValue), callback)
      })
    })
  }

  cursor (range, direction, callback) {
    this.readOnly((error, ro) => {
      if (error) return callback(error)
      returnResult(ro.openCursor(this.range(range), direction), callback)
    })
  }

  indexCursor (name, range, direction, callback) {
    this.readOnly((error, ro) => {
      if (error) return callback(error)
      returnResult(ro.index(name).openCursor(this.range(range), direction), callback)
    })
  }

  select (indexName, rangeOptions, direction, callback) {
    const range = rangeOptions ? this.range(rangeOptions) : null

    if (arguments.length === 3) {
      callback = direction
      direction = undefined
    }

    this.readOnly((error, ro) => {
      if (error) return callback(error)
      returnResult(ro.index(indexName).openCursor(range, direction), callback)
    })
  }

  update (doc) {
    return createPromise(arguments, (callback, resolve, reject) => {
      this._update(doc, callback, resolve, reject, id => {
        this.db.push.add({
          action: 'update',
          store: this.name,
          id: id,
          doc: doc
        })
      })
    })
  }

  _update (doc, callback, resolve, reject, push) {
    this.readWrite((error, rw) => {
      if (error) return callback(error)
      returnResult(rw.put(doc), callback, resolve, reject, push)
    })
  }

  delete (id) {
    return createPromise(arguments, (callback, resolve, reject) => {
      this._delete(id, callback, resolve, reject, () => {
        this.db.push.add({
          action: 'delete',
          store: this.name,
          id: id
        })
      })
    })
  }

  _delete (id, callback, resolve, reject, push) {
    this.readWrite((error, rw) => {
      if (error) return callback(error)
      returnResult(rw.delete(id), callback, resolve, reject, push)
    })
  }

  count () {
    return createPromise(arguments, (callback, resolve, reject) => {
      this.readOnly((error, ro) => {
        if (error) return callback(error)
        returnResult(ro.count(), callback, resolve, reject)
      })
    })
  }

  range (options) {
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

  testing (optionalDB) {
    createTestingDB || (createTestingDB = require('../').createTestingDB)
    const db = optionalDB || createTestingDB()
    return db.store(this.name, this.isSimpleStore ? null : {
      key: this.key,
      indexes: this.indexes,
      upgrade: this._upgrade,
      testing: true,
      db
    })
  }
}

module.exports = Store;

function returnResult (request, callback, resolve, reject, push) {
  request.onerror = e => {
    if (callback) {
      callback(e.target.error)
    } else {
      reject(e.target.error)
    }
  }

  request.onsuccess = e => {
    if (callback) {
      callback(undefined, e.target.result)
    } else {
      resolve(e.target.result)
    }

    if (push) push(e.target.result)
  }
}

function createPromise (args, fn) {
  const cb = args[args.length - 1]
  if (typeof cb === 'function') return fn(cb)

  return new Promise((resolve, reject) => fn(undefined, resolve, reject))
}
