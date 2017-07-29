"use strict"

const idb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;

const Store = require("./store");
const Push = require("./push")
const Pull = require("./indexeddb-pull")

class DB {
  constructor (name, options) {
    this.idb = null;
    this.name = name
    this.version = options.version
    this.stores = options.stores || []
    this.push = new (options.Push || Push)()
    this.pull = new (options.Pull || Pull)(this)
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
    this.push.hook(target)
    target.push.hook(this)
  }
}
module.exports = DB;
