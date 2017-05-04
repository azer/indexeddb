"use strict"

const idb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;

const Store = require("./store");

class DB {
  constructor (name, options) {
    this.idb = null;
    this.name = name
    this.version = options.version
    this.stores = options.stores || []
    this.syncWith = []
  }

  open (callback) {
    const request = idb.open(this.name, this.version)

    request.onupgradeneeded = event => {
      this.onUpgradeNeeded(event)
    }

    request.onsuccess = event => {
      this.idb = request.result
      callback(undefined, this.idb)
    }

    request.onerror = event => {
      callback(event)
    }

    request.onblocked = event => {
      callback(new Error(this.name + " can not be opened because it's still open somewhere else."))
    }
  }

  close () {
    this.idb.close()
  }

  ready (callback) {
    if (this.idb) return callback()
    this.open(callback)
  }

  store (name, options) {
    var s = new Store(name, options)
    s.db = this;
    this.stores.push(s)
    return s
  }

  transaction (storeNames, type, callback) {
    this.ready((error) => {
      if (error) return callback(error)
      callback(undefined, this.idb.transaction(storeNames, type))
    })
  }

  onUpgradeNeeded (event) {
    this.stores.forEach(store => store.create(event.target.result, event))
  }

  delete () {
    indexedDB.deleteDatabase(this.name)
  }

  sync (target) {
    if (!target.pull && !target.push) throw new Error('Invalid sync target.')
    this.syncWith.push(target)

    if (typeof target.sync === 'function' && Array.isArray(target.syncWith)) {
      target.syncWith.push(this)
    }
  }

  push (action, options) {
    var i = this.syncWith.length
    while (i--) {
      this.syncWith[i].pull(action, options)
    }
  }

  pull (action, options) {
    var store

    var i = this.stores.length
    while (i--) {
      if (this.stores[i].name === options.store) {
        store = this.stores[i]
        break
      }
    }

    if (!store) return

    if (action === 'add') {
      options.doc.id = options.id
      return store._add(options.doc, err => {
        if (err) throw err
      })
    }

    if (action === 'update') {
      return store._update(options.doc, err => {
        if (err) throw err
      })
    }

    if (action === 'delete') {
      return store._delete(options.id, err => {
        if (err) throw err
      })
    }
  }
}

module.exports = DB;
