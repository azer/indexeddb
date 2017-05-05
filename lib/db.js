"use strict"

const idb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;

const Store = require("./store");
const Push = require("./push")

class DB {
  constructor (name, options) {
    this.idb = null;
    this.name = name
    this.version = options.version
    this.stores = options.stores || []
    this.push = new Push()
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
    if (target.pull) {
      this.push.hook(target)
    }

    if (target.push) {
      target.push.hook(this)
      return
    }

    if (target.subscribe) {
      target.push = new Push;
      target.push.hook(this)
      setImmediate(() => target.subscribe(target.push.add))
    }
  }

  pull (updates) {
    const stores = {}

    var i = this.stores.length
    while (i--) {
      stores[this.stores[i].name] = this.stores[i]
    }

    var update, store
    i = updates.length
    while (i--) {
      update = updates[i]
      store = stores[update.store]
      if (!store) continue

      if (update.action === 'add') {
        update.doc.id = update.id
        return store._add(update.doc, err => {
          if (err) throw err
        })
      }

      if (update.action === 'update') {
        return store._update(update.doc, err => {
          if (err) throw err
        })
      }

      if (update.action === 'delete') {
        return store._delete(update.id, err => {
          if (err) throw err
        })
      }
    }
  }
}

module.exports = DB;
