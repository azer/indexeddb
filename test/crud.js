const test = require("prova")
const samples = require('./samples')

test('add + get', function (t) {
  const people = samples.store()
  t.plan(5)

  people.add({ name: 'azer', email: 'azer@roadbeats.com' }, (error, id) => {
    t.error(error)

    t.equal(id, 1)

    people.get(id, (error, doc) => {
      t.error(error)
      t.equal(doc.name, 'azer')
      t.equal(doc.email, 'azer@roadbeats.com')

      people.db.delete()
    })
  })
})

test('update', function (t) {
  const people = samples.store()
  t.plan(5)

  people.add({ name: 'azer', email: 'azer@roadbeats.com' }, (error, id) => {
    t.error(error)

    people.update({ id: 1, name: 'nova', email: 'nova@roadbeats.com' }, error => {
      t.error(error)

      people.get(id, (error, doc) => {
        t.error(error)
        t.equal(doc.name, 'nova')
        t.equal(doc.email, 'nova@roadbeats.com')

        people.db.delete()
      })
    })
  })
})

test('delete', function (t) {
  const people = samples.store()
  t.plan(4)

  people.add({ name: 'azer', email: 'azer@roadbeats.com' }, (error, id) => {
    t.error(error)

    people.delete(id, error => {
      t.error(error)

      people.get(id, (error, doc) => {
        t.error(error)
        t.notOk(doc)

        people.db.delete()
      })
    })
  })
});

test('getByIndex', function (t) {
  const people = samples.store()

  t.plan(5)
  samples.createData(people, error => {
    t.error(error)

    people.getByIndex('name', 'azer', (error, result) => {
      t.error(error)

      t.equal(result.id, 1)
      t.equal(result.name, 'azer')
      t.equal(result.email, 'azer@roadbeats.com')

      people.db.delete()
    })
  })
})

test('count', function (t) {
  const people = samples.store()
  t.plan(3)

  samples.createData(people, error => {
    t.error(error)

    people.count((error, count) => {
      t.error(error)
      t.equal(count, 6)

      people.db.delete()
    })
  })
})
