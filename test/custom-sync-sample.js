const createDB = require("../").createTestingDB
const Push = require("../lib/push")
const Pull = require("../lib/pull")
const api = require("./api")

class APIHook {
  constructor() {
    this.lastSyncedAt = 0
    this.pull = new APIPull(this)
    this.push = new APIPush(this)
  }
}

class APIPull extends Pull {
  constructor(hook) {
    super()
    this.parent = hook
    this.intervalMS = 1000
  }

  receive(updates) {
    if (!Array.isArray(updates)) {
      updates = [updates]
    }

    api.post('/sync-api', updates, (error, resp) => {
      if (error) {
        return this.onError(error)
      }

      this.parent.lastSyncedAt = resp.time
    })
  }

  onError(err) {
    console.error('screwed up', err)
  }
}

class APIPush extends Push {
  constructor(hook) {
    super()
    this.parent = hook
    this.intervalMS = 1000
    this.scheduledAt = 0
    this.schedule()
  }

  schedule() {
    if (this.scheduledAt > 0) {
      // already scheduled
      return
    }

    this.scheduledAt = Date.now()
    this.scheduler = setTimeout(() => this.checkForUpdates(), this.intervalMS)
  }

  checkForUpdates() {
    api.get(`/sync-api?ts=${this.parent.lastSyncedAt}`, (error, updates) => {
      if (error) return this.onError(error)
      this.publish(updates)
    })
  }

  onError(err) {
    console.error('screwed up > > >', err)
  }
}

module.exports = {
  APIHook: APIHook,
  APIPull: APIPull,
  APIPush: APIPush
}
