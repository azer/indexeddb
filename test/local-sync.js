const test = require("prova")
const samples = require("./samples")

test('syncing three different indexeddb databases', function (t) {
  t.plan(17)

  const a = samples.store()
  const b = samples.store()
  const c = samples.store()

  a.db.sync(b.db)
  a.db.sync(c.db)

  a.add({ name: 'azer', email: 'azer@roadbeats.com' }, (error, id) => {
    t.error(error)
    t.equal(id, 1)

    setTimeout(function () {
      b.get(id, (error, doc) => {
        t.error(error)
        t.ok(doc)
        t.equal(doc.name, 'azer')
        t.equal(doc.email, 'azer@roadbeats.com')

        c.update({ id: 1, name: 'nova', email: 'nova@roadbeats.com' }, error => {
          t.error(error)
          setTimeout(function () {
            a.get(id, (error, doc) => {
              t.error(error)
              t.equal(doc.name, 'nova')
              t.equal(doc.email, 'nova@roadbeats.com')

              a.delete(id, function (error) {
                t.error(error)

                setTimeout(function () {
                  a.get(id, (error, doc) => {
                    t.error(error)
                    t.notOk(doc)
                  })

                  b.get(id, (error, doc) => {
                    t.error(error)
                    t.notOk(doc)
                  })

                  c.get(id, (error, doc) => {
                    t.error(error)
                    t.notOk(doc)
                  })

                  a.db.delete()
                  b.db.delete()
                  c.db.delete()
                }, 100)
              })

            })
          }, 100)
        })
      })
    }, 100)
  })
})
