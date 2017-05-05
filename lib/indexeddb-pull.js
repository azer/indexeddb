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

  copy (updates) {
    const stores = this.stores()

    var update, store
    var i = updates.length
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

module.exports = IndexedDBPull
