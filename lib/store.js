"use strict"

const READ_WRITE = 'readwrite'
const READ_ONLY = 'readonly'

class Store {
  constructor (name, options) {
    this.name = name
    this.key = options.key
    this.db = options.db;
    this.indexes = options.indexes || [];
    this.idbStore = null;
  }

  create (db) {
    if (db.objectStoreNames.contains(this.name)) return
    this.idbStore = db.createObjectStore(this.name, this.key)
    this.indexes.forEach(index => this.idbStore.createIndex(index.name, index.path || index.name, index.options))
  }

  mode (type, callback) {
    return this.db.transaction([this.name], type, (error, tx) => {
      if (error) return callback()
      callback(undefined, tx.objectStore(this.name))
    })
  }

  readWrite (callback) {
    return this.mode(READ_WRITE, callback)
  }

  readOnly (callback) {
    return this.mode(READ_ONLY, callback)
  }

  cursor (range, callback) {
    const request = this.readOnly().openCursor()
    request.onerror = e => callback(e.target.error)
    request.onsuccess = e => callback(undefined, e.target.result)
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

    throw new Error('Invalid range options.')
  }

  add (doc, callback) {
    this.readWrite((error, rw) => {
      const request = rw.add(doc)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback(undefined, e.target.result)
    })
  }

  get (key, callback) {
    const request = this.readOnly((error, ro) => {
      const request = ro.get(key)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback(undefined, e.target.result)
    })
  }

  select (indexName, indexValue, callback) {
    this.readOnly((error, ro) => {
      const request = ro.index(indexName).get(indexValue)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => {
        callback(undefined, e.target.result)
      }
    })
  }

  selectRange (indexName, rangeOptions, callback) {
    this.readOnly((error, ro) => {
      const request = ro.index(indexName).openCursor(this.range(rangeOptions))
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback(undefined, e.target.result)
    })
  }

  update (doc, callback) {
    this.readWrite((error, rw) => {
      const request = rw.put(doc)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback()
    })
  }

  delete (id, callback) {
    this.readWrite((error, rw) => {
      const request = rw.delete(id)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback()
    })
  }

  count (callback) {
    this.readOnly((error, ro) => {
      const request = ro.count()
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback(undefined, e.target.result)
    })
  }
}

module.exports = Store;
