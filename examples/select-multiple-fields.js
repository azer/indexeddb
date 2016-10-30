document.write('see the console')

const db = window.db = require("../")('./select-test', { version: 1 })

const people = db.store('people', {
  key: { autoIncrement: true, keyPath: 'id' },
  indexes: [
    'name',
    'age',
    'country',
    { name: 'age+country', fields: ['age', 'country'] }
  ]
})

ready(function () {

  people.select('age+country', [20, 'jamaika'], function (error, result) {
    if (error) throw error
    if (!result) return console.log('done')

    console.log(result.value)
    result.continue()
  })

})


function ready (cb) {
  if (localStorage['ready']) return cb()

  people.add({ name: 'foo', country: 'jamaika', age: 20 }, error => {
    if (error) throw error

    people.add({ name: 'foo', country: 'korea', age: 20 }, error => {
      if (error) throw error

      people.add({ name: 'bar', country: 'jamaika', age: 25 }, error => {
        if (error) throw error

        people.add({ name: 'qux', country: 'jamaika', age: 20 }, error => {
          if (error) throw error

          console.log('created')
          localStorage['ready'] = true
          cb()
        })
      })
    })
  })
}
