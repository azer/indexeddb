const test = require("prova")
const samples = require("./fixtures/samples")

test("select range", function(t) {
  const people = samples.store()
  t.plan(6)

  samples.createData(people, error => {
    t.error(error)

    people.select("name", { from: "b", to: "g" }, (error, result) => {
      t.error(error)

      if (!result) people.db.delete()

      t.equal(result.value.id, 6)
      t.equal(result.value.name, "foo")
      t.equal(result.value.email, "foo@roadbeats.com")

      result.continue()
    })
  })
})

test("searching by tag", function(t) {
  const people = samples.store()
  t.plan(8)

  var ctr = -1
  var expected = [{ id: 1, name: "azer" }, { id: 6, name: "foo" }]

  samples.createData(people, error => {
    t.error(error)

    people.select("tags", { only: "software" }, (error, result) => {
      t.error(error)

      if (!result) return people.db.delete()

      ctr++
      t.equal(result.value.id, expected[ctr].id)
      t.equal(result.value.name, expected[ctr].name)

      result.continue()
    })
  })
})

test("sorting by index", function(t) {
  const people = samples.store()
  t.plan(27)

  var desc = [40, 30, 29, 25, 23, 10]
  var asc = [10, 23, 25, 29, 30, 40]
  var dctr = -1
  var actr = -1

  samples.createData(people, error => {
    t.error(error)

    people.select("age", null, "prev", function(error, result) {
      t.error(error)
      if (!result) return people.db.delete()

      dctr++
      t.equal(result.value.age, desc[dctr])
      result.continue()
    })

    people.select("age", null, "next", function(error, result) {
      t.error(error)
      if (!result) return people.db.delete()

      actr++
      t.equal(result.value.age, asc[actr])
      result.continue()
    })
  })
})

test("selecting range with multiple indexes", function(t) {
  const people = samples.store()

  t.plan(9)

  samples.createData(people, error => {
    t.error(error)

    const expected1 = [1]
    let ctr1 = -1

    people.select("name+age", ["azer", 29], (error, result) => {
      t.error(error)
      if (!result) return people.db.delete()
      t.equal(result.value.id, expected1[++ctr1])
      result.continue()
    })

    const expected2 = [3, 5]
    let ctr2 = -1
    people.select(
      "name+age",
      { from: ["a", 20], to: ["ap" + "\uffff", 30] },
      (error, result) => {
        t.error(error)
        if (!result) return people.db.delete()
        t.equal(result.value.id, expected2[++ctr2])
        result.continue()
      }
    )
  })
})
