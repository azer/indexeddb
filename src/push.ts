import * as types from "./types"

export default class Push implements types.IPush {
  public targets: types.IDB[]
  constructor() {
    this.targets = []
  }

  hook(target: types.IDB) {
    this.targets.push(target)
  }

  publish(
    updates: types.IUpdate | types.IUpdate[],
    callback: types.IMultipleErrorsCallback
  ) {
    const errors: Error[] = []
    var self = this

    next(0)

    function next(i) {
      if (i >= self.targets.length) {
        callback(errors.length ? errors : undefined)
        return
      }

      self.targets[i].pull.receive(updates, err => {
        if (err) {
          errors.push(err)
        }

        next(i + 1)
      })
    }
  }
}
