class Push {
  constructor () {
    this.targets = []
  }

  hook (pull) {
    this.targets.push(pull)
  }

  publish (updates, callback) {
    const errors = []
    var self = this

    next(0)

    function next (i) {
      if (i >= self.targets.length) return callback && callback(errors.length ? errors : undefined)

      self.targets[i].pull.receive(updates, err => {
        if (err) {
          console.error('Can not push to receiver.', err, self.targets[i].pull.receive)
          errors.push(err)
        }

        next(i+1)
      })
    }
  }
}

module.exports = Push
