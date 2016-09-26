"use strict"

const idb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;

const Store = require("./store");

class DB {
  constructor (name, options) {
    this.idb = null;
    this.name = name
    this.version = options.version
    this.stores = options.stores || []
  }

  open (callback) {
    const request = idb.open(this.name, this.version)

    request.onupgradeneeded = this.onUpgradeNeeded.bind(this)

    request.onsuccess = event => {
      this.idb = request.result
      callback(undefined, this.idb)
    }

    request.onerror = event => {
      callback(undefined, event)
    }
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
    this.stores.forEach(store => store.create(event.target.result))
  }

}

module.exports = DB;
