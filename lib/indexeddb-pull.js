const Pull = require("./pull")

class IndexedDBPull extends Pull {
  constructor(db) {
    super()
    this.db = db
  }

  stores () {
    if (this._stores) return this._stores

    this._stores = {}

    var i = this.db.stores.length
    while (i--) {
      this._stores[this.db.stores[i].name] = this.db.stores[i]
    }

    return this._stores
  }

  receive (updates, callback) {
    super.receive()

    if (!Array.isArray(updates)) {
      return this.copyUpdate(updates, callback)
    }

    const self = this
    next(0)

    function next (i) {
      if (i >= updates.length) return callback && callback()

      self.copyUpdate(updates[i], err => {
        if (err) return callback(err)
        next(i+1)
      })
    }
  }

  copyUpdate(update, callback) {
    const stores = this.stores()
    const store = stores[update.store]

    if (!store) return callback(new Error('Unknown store: ' + update.store))

    if (update.action === 'add') {
      update.doc.id = update.id
      return store._add(update.doc, callback)
    }

    if (update.action === 'update') {
     return store._update(update.doc, callback)
    }

    if (update.action === 'delete') {
      return store._delete(update.id, callback)
    }
  }
}

module.exports = IndexedDBPull
