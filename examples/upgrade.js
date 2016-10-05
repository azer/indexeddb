const createDB = require("../");
const version = Number(localStorage['version'] || 1)
localStorage['version'] = version + 1

console.log('Current version: ', version)

const db = window.db = createDB('upgrade-test', {
  version
})

const fruits = db.store('fruits', {
  key: { autoIncrement: true, keyPath: 'id' },
  upgrade: upgrade
})

function upgrade (store) {
  console.log('upgrading')
  store.createIndex('name', { unique : false })
}

fruits.add({ name: prompt('Add a fruit: ') }, (error, id) => {
  if (error) return console.error(error)

  console.log('added', id)

  console.log('Rows =>')

  fruits.selectRange('name', { from: 'a', to: 'z' }, (error, result) => {
    if (error) return console.error(error)
    if (result === null) return console.error(error, result)

    console.log('  Id:', result.value.id)
    console.log('  Name:', result.value.name)

    console.log(result)
    result.continue()
  })
})
