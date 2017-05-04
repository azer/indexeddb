'strict mode'

const test = require("prova");
const createDB = require("./").createTestingDB;

const data = [
  { name: 'azer', email: 'azer@roadbeats.com', age: 29, tags: ['software', 'travel'] },
  { name: 'aziz', email: 'aziz@roadbeats.com', age: 30, tags: ['fun'] },
  { name: 'ammar', email: 'ammar@roadbeats.com', age: 23, tags: ['finance'] },
  { name: 'nova', email: 'nova@roadbeats.com', age: 25, tags: ['photography', 'travel'] },
  { name: 'apo', email: 'apo@roadbeats.com', age: 40, tags: ['documentary', 'videography'] },
  { name: 'foo', email: 'foo@roadbeats.com', age: 10, tags: ['software', 'testing'] }
]

test('add + get', function (t) {
  const people = store()
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
  const people = store()
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
  const people = store()
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
  const people = store()

  t.plan(5)
  createData(people, error => {
    t.error(error)

    people.getByIndex('name', 'azer', (error, result) => {
      t.error(error)

      t.equal(result.id, 1)
      t.equal(result.name, 'azer')
      t.equal(result.email, 'azer@roadbeats.com')

      people.db.delete()
    })
  })
});

test('select range', function (t) {
  const people = store()
  t.plan(6)

  createData(people, error => {
    t.error(error)

    people.select('name', { from: 'b', to: 'g' }, (error, result) => {
      t.error(error)

      if (!result) people.db.delete()

      t.equal(result.value.id, 6)
      t.equal(result.value.name, 'foo')
      t.equal(result.value.email, 'foo@roadbeats.com')

      result.continue()
    })
  })
});

test('count', function (t) {
  const people = store()
  t.plan(3)

  createData(people, error => {
    t.error(error)

    people.count((error, count) => {
      t.error(error)
      t.equal(count, 6)

      people.db.delete()
    })
  })
})

test('searching by tag', function (t) {
  const people = store()
  t.plan(8)

  var ctr = -1;
  var expected = [
    { id: 1, name: 'azer' },
    { id: 6, name: 'foo' }
  ];

  createData(people, error => {
    t.error(error)

    people.select('tags', { only: 'software' }, (error, result) => {
      t.error(error)

      if (!result) return people.db.delete()

      ctr++;
      t.equal(result.value.id, expected[ctr].id)
      t.equal(result.value.name, expected[ctr].name)

      result.continue()
    })
  })
})

test('sorting by index', function (t) {
  const people = store()
  t.plan(27)

  var desc = [40, 30, 29, 25, 23, 10]
  var asc = [10, 23, 25, 29, 30, 40]
  var dctr = -1
  var actr = -1

  createData(people, error => {
    t.error(error)

    people.select('age', null, 'prev', function (error, result) {
      t.error(error)
      if (!result) return people.db.delete()

      dctr++
      t.equal(result.value.age, desc[dctr])
      result.continue()
    })

    people.select('age', null, 'next', function (error, result) {
      t.error(error)
      if (!result) return people.db.delete()

      actr++
      t.equal(result.value.age, asc[actr])
      result.continue()
    })
  })
})

test('selecting range with multiple indexes', function (t) {
  const people = store()

  t.plan(9)

  createData(people, error => {
    t.error(error)

    const expected1 = [1]
    let ctr1 = -1

    people.select('name+age', ['azer', 29], (error, result) => {
      t.error(error)
      if (!result) return people.db.delete()
      t.equal(result.value.id, expected1[++ctr1])
      result.continue()
    })

    const expected2 = [3, 5]
    let ctr2 = -1
    people.select('name+age', { from: ['a', 20], to: ['ap' + '\uffff', 30] }, (error, result) => {
      t.error(error)
      if (!result) return people.db.delete()
      t.equal(result.value.id, expected2[++ctr2])
      result.continue()
    })
  })
})

test('syncing three different indexeddb databases', function (t) {
  t.plan(17)

  const a = store()
  const b = store()
  const c = store()

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

function store (db) {
  return createDB().store('people', {
    indexes: [
      { name: 'email', options: { unique: true } },
      { name: 'tags', options: { multiEntry: true, unique: false } },
      { name: 'name+age', fields: ["name", "age"] },
      'name',
      'age',
    ]
  })
}

function createData (store, callback) {
  Promise.all(data.map(row => store.add(row)))
    .catch(callback)
    .then(() => callback())
}
