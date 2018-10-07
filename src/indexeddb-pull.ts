import Pull from "./pull"
import * as types from "./types"

export default class IndexedDBPull extends Pull
  implements types.IIndexedDBPull {
  public db: types.IDB
  private _stores: types.IStoreMap | undefined
  constructor(db: types.IDB) {
    super()
    this.db = db
  }

  stores(): types.IStoreMap {
    if (this._stores) return this._stores

    this._stores = {}

    var i = this.db.stores.length
    while (i--) {
      this._stores[this.db.stores[i].name] = this.db.stores[i]
    }

    return this._stores
  }

  receive(updates: types.IUpdate[] | types.IUpdate, callback: types.ICallback) {
    if (!Array.isArray(updates)) {
      return this.copyUpdate(updates, callback)
    }

    const self = this
    next(0)

    function next(i) {
      if (i >= (updates as types.IUpdate[]).length)
        return callback && callback()

      self.copyUpdate(updates[i], err => {
        if (err) return callback(err)
        next(i + 1)
      })
    }
  }

  copyUpdate(update: types.IUpdate, callback: types.ICallback) {
    const stores = this.stores()
    const store = stores[update.store]

    if (!store) return callback(new Error("Unknown store: " + update.store))

    if (update.action === "add") {
      update.doc.id = update.documentId
      store._add(update.doc, callback)
      return
    }

    if (update.action === "update") {
      store._update(update.doc, callback)
      return
    }

    if (update.action === "delete") {
      store._delete(update.documentId, callback)
      return
    }
  }
}
