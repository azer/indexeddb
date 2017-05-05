class Push {
  constructor () {
    this.targets = []
  }

  hook (pull) {
    this.targets.push(pull)
  }

  add (update) {
    var i = this.targets.length
    while (i--) {
      this.targets[i].pull.add(update)
    }
  }
}

module.exports = Push
