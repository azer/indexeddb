class Push {
  constructor () {
    this.targets = []
    this.updates = []
    this.scheduledAt = 0
    this.scheduler = undefined
    this.intervalMS = 50
  }

  add (update) {
    if (Array.isArray(update)) {
      this.updates.push.apply(this.nextPush, update)
    } else {
      this.updates.push(update)
    }

    this.schedule()
  }

  hook (target) {
    this.targets.push(target)
  }

  schedule () {
    if (this.scheduledAt > 0) {
      // already scheduled
      return
    }

    this.scheduledAt = Date.now()
    this.scheduler = setTimeout(() => this.free(), this.intervalMS)
  }

  free () {
    const updates = this.updates.splice(0)
    this.abort()

    var i = this.targets.length
    while (i--) {
      this.targets[i].pull(updates)
    }
  }

  abort () {
    clearTimeout(this.scheduler)
    this.scheduledAt = 0
  }
}

module.exports = Push
