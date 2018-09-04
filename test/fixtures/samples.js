const createDB = require("../../").createTestingDB

const data = [
  {
    name: "azer",
    email: "azer@roadbeats.com",
    age: 29,
    tags: ["software", "travel"]
  },
  { name: "aziz", email: "aziz@roadbeats.com", age: 30, tags: ["fun"] },
  { name: "ammar", email: "ammar@roadbeats.com", age: 23, tags: ["finance"] },
  {
    name: "nova",
    email: "nova@roadbeats.com",
    age: 25,
    tags: ["photography", "travel"]
  },
  {
    name: "apo",
    email: "apo@roadbeats.com",
    age: 40,
    tags: ["documentary", "videography"]
  },
  {
    name: "foo",
    email: "foo@roadbeats.com",
    age: 10,
    tags: ["software", "testing"]
  }
]

module.exports = {
  store: store,
  createData: createData
}

function store(options) {
  return createDB(options).store("people", {
    indexes: [
      { name: "email", options: { unique: true } },
      { name: "tags", options: { multiEntry: true, unique: false } },
      { name: "name+age", fields: ["name", "age"] },
      "name",
      "age"
    ]
  })
}

function createData(store, callback) {
  Promise.all(data.map(row => store.add(row)))
    .catch(callback)
    .then(() => callback())
}
