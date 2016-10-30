"use strict"

const READ_WRITE = 'readwrite'
const READ_ONLY = 'readonly'

class Store {
  constructor (name, options) {
    this.name = name
    this.key = options.key
    this.db = options.db
    this.indexes = options.indexes || []
    this.idbStore = null
    this._upgrade = options.upgrade
  }

  create (db, event) {
    if (db.objectStoreNames.contains(this.name)) {
      return this.upgrade(event)
    }

    this.idbStore = db.createObjectStore(this.name, this.key)
    this.indexes.forEach(index => this.idbStore.createIndex(index.name, index.path || index.paths || index.field || index.fields || index.name, index.options))
  }


  createIndex (name, options) {
    this.idbStore.createIndex(name, name, options)
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
      const request = ro.openCursor()
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback(undefined, e.target.result)
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

  add (doc, callback) {
    this.readWrite((error, rw) => {
      if (error) return callback(error)

      const request = rw.add(doc)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback(undefined, e.target.result)
    })
  }

  get (key, callback) {
    this.readOnly((error, ro) => {
      if (error) return callback(error)

      const request = ro.get(key)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback(undefined, e.target.result)
    })
  }

  getByIndex (indexName, indexValue, callback) {
    this.readOnly((error, ro) => {
      if (error) return callback(error)

      const request = ro.index(indexName).get(indexValue)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => {
        callback(undefined, e.target.result)
      }
    })
  }

  indexCursor (name, range, direction, callback) {
    this.readOnly((error, ro) => {
      if (error) return callback(error)

      const request = ro.index(name).openCursor(range, direction)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback(undefined, e.target.result)
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

      const request = ro.index(indexName).openCursor(range, direction)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback(undefined, e.target.result)
    })
  }

  update (doc, callback) {
    this.readWrite((error, rw) => {
      if (error) return callback(error)

      const request = rw.put(doc)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback()
    })
  }

  delete (id, callback) {
    this.readWrite((error, rw) => {
      if (error) return callback(error)

      const request = rw.delete(id)
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback()
    })
  }

  count (callback) {
    this.readOnly((error, ro) => {
      if (error) return callback(error)

      const request = ro.count()
      request.onerror = e => callback(e.target.error)
      request.onsuccess = e => callback(undefined, e.target.result)
    })
  }

}

module.exports = Store;
