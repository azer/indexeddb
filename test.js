'strict mode'

const test = require("prova");
const createDB = require("./").createTestingDB;

test('add + get', function (t) {
  const people = store()
  t.plan(4)

  people.add({ name: 'azer', email: 'azer@roadbeats.com' }, (error, id) => {
    t.error(error)

    people.get(id, (error, doc) => {
      t.error(error)
      t.equal(doc.name, 'azer')
      t.equal(doc.email, 'azer@roadbeats.com')

      people.db.delete()
    })
  })
});

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
  t.plan(6)

  people.add({ name: 'azer', email: 'azer@roadbeats.com' }, (error, id) => {
    t.error(error)

    people.add({ name: 'nova', email: 'nova@roadbeats.com' }, (error, id) => {
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
});

test('select range', function (t) {
  const people = store()
  t.plan(8)

  people.add({ name: 'azer', email: 'azer@roadbeats.com' }, (error, id) => {
    t.error(error)

    people.add({ name: 'nova', email: 'nova@roadbeats.com' }, (error, id) => {
      t.error(error)

      people.add({ name: 'foo', email: 'foo@roadbeats.com' }, (error, id) => {
        t.error(error)

        people.select('name', { from: 'b', to: 'g' }, (error, result) => {
          t.error(error)

          if (!result) people.db.delete()

          t.equal(result.value.id, 3)
          t.equal(result.value.name, 'foo')
          t.equal(result.value.email, 'foo@roadbeats.com')

          result.continue()
        })
      })
    })
  })
});

test('count', function (t) {
  const people = store()
  t.plan(5)

  people.add({ name: 'azer', email: 'azer@roadbeats.com' }, (error, id) => {
    t.error(error)

    people.add({ name: 'nova', email: 'nova@roadbeats.com' }, (error, id) => {
      t.error(error)

      people.add({ name: 'foo', email: 'foo@roadbeats.com' }, (error, id) => {
        t.error(error)

        people.count((error, count) => {
          t.error(error)
          t.equal(count, 3)

          people.db.delete()
        })
      })
    })
  })
})

test('searching by tag', function (t) {
  const people = store()
  t.plan(10)

  var ctr = -1;
  var expected = [
    { id: 1, name: 'azer' },
    { id: 3, name: 'foo' }
  ];

  people.add({ name: 'azer', email: 'azer@roadbeats.com', tags: ['software', 'travel'] }, (error, id) => {
    t.error(error)

    people.add({ name: 'nova', email: 'nova@roadbeats.com', tags: ['photography', 'travel'] }, (error, id) => {
      t.error(error)

      people.add({ name: 'foo', email: 'foo@roadbeats.com', tags: ['software', 'testing'] }, (error, id) => {
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
  })
})

test('sorting by index', function (t) {
  const people = store()
  t.plan(17)

  var desc = [30, 29, 26]
  var asc = [26, 29, 30]
  var dctr = -1
  var actr = -1

  people.add({ name: 'azer', email: 'azer@roadbeats.com', age: 29 }, (error, id) => {
    t.error(error)

    people.add({ name: 'nova', email: 'nova@roadbeats.com', age: 26 }, (error, id) => {
      t.error(error)

      people.add({ name: 'foo', email: 'foo@roadbeats.com', age: 30 }, (error, id) => {
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
  })
})

test('selecting range with multiple indexes', function (t) {
  const people = store()

  t.plan(11)

  people.add({ name: 'azer', email: 'azer@roadbeats.com', age: 29 }, (error, id) => {
    t.error(error)

    people.add({ name: 'azer', email: 'azer1@roadbeats.com', age: 30 }, (error, id) => {
      t.error(error)

      people.add({ name: 'apo', email: 'aziz@roadbeats.com', age: 26 }, (error, id) => {
        t.error(error)

        people.add({ name: 'ammar', email: 'ammar@roadbeats.com', age: 31 }, (error, id) => {
          t.error(error)

          const expected1 = [1]
          let ctr1 = -1

          people.select('name+age', ['azer', 29], (error, result) => {
            t.error(error)
            if (!result) return people.db.delete()
            t.equal(result.value.id, expected1[++ctr1])
            result.continue()
          })

          const expected2 = [4, 3]
          let ctr2 = -1
          people.select('name+age', { from: ['a', 20], to: ['ap' + '\uffff', 30] }, (error, result) => {
            t.error(error)
            if (!result) return people.db.delete()
            t.equal(result.value.id, expected2[++ctr2])
            result.continue()
          })
        })
      })
    })
  })
})

function store (db) {
  return createDB().store('people', {
    key: { autoIncrement: true, keyPath: 'id' },
    indexes: [
      { name: 'email', options: { unique: true } },
      { name: 'tags', options: { multiEntry: true, unique: false } },
      { name: 'name+age', fields: ["name", "age"] },
      'name',
      'age',
    ]
  })
}
