const test = require("prova")
const samples = require("./fixtures/samples")
const APIHook = require("./fixtures/custom-sync-sample").APIHook
const api = require("./fixtures/api")

test("should send update objects to remote server", t => {
  t.plan(13)

  const people = samples.store()
  const hook = new APIHook()

  people.db.sync(hook)

  people.add({ name: "azer", email: "azer@roadbeats.com" })
  people.add({ name: "nova", email: "nova@roadbeats.com" })
  people.add({ name: "yolo", email: "yolo@roadbeats.com" })
  people.delete("3")

  setTimeout(() => {
    t.ok(hook.lastSyncedAt > 0)

    api.get("/sync-api", (error, result) => {
      t.error(error)
      t.equal(result.length, 4)
      t.equal(result[0].action, "add")
      t.equal(result[0].doc.email, "azer@roadbeats.com")
      t.equal(result[1].action, "add")
      t.equal(result[1].doc.email, "nova@roadbeats.com")
      t.equal(result[2].action, "delete")
      t.equal(result[2].documentId, "3")
      t.equal(result[3].doc.email, "pablo@roadbeats.com")
      t.equal(result[3].action, "add")
    })

    people.get("4", (error, doc) => {
      t.error(error)
      t.equal(doc.email, "pablo@roadbeats.com")
    })
  }, 1250)
})
