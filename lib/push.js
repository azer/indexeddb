class Push {
  constructor () {
    this.targets = []
  }

  hook (pull) {
    this.targets.push(pull)
  }

  publish (updates, callback) {
    var self = this

    next(0)

    function next (i) {
      if (i >= self.targets.length) return callback && callback()

      self.targets[i].pull.receive(updates, err => {
        if (err) return callback(err)
        next(i+1)
      })
    }
  }
}

module.exports = Push
