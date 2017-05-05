class Pull {
  constructor() {
    this.updates = []
    this.intervalMS = 50
    this.scheduler = undefined
    this.scheduledAt = 0
  }

  add (update) {
    if (Array.isArray(update)) {
      this.updates.push.apply(this.nextPush, update)
    } else {
      this.updates.push(update)
    }

    this.schedule()
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
    this.scheduledAt = 0
    this.copy(updates)
  }

  abort () {
    clearTimeout(this.scheduler)
    this.scheduledAt = 0
  }

  copy (updates) {
    throw new Error("not implemented")
  }
}

module.exports = Pull
