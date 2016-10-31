## indexeddb

Low-level Minimalistic wrapper for HTML5 IndexedDB API. It supports both callbacks and promises.

See `test.js` for examples.

## Install

```bash
$ npm install kaktus/indexeddb
```

## API

Initializing:

```js
const db = require('indexeddb')('mydb', {
    version: 1
})

// Create your stores before opening the connection
const people = db.store('people', {
    key: { autoIncrement: true, keyPath: 'id' },
    indexes: [
      { name: 'email', options: { unique: true } },
      'name',
      'country'
    ]
})
```

#### `.add`

Store method to add documents.

Parameters: `store.add(document, callback)`

```js
people.add({ name: 'foo', email: 'bar@qux.com' }, error => console.log(error))
```

#### `.all`

Store method to iterate all documents in the store.

```js
people.all((error, result) => console.log(error, result))
```

#### `.get`

Store method to get a document by key value.

Parameters: `store.get(key, callback)`

```js
people.get(1, (error, result) => console.log(error, result))
```

#### `.getByIndex`

Store method to get document(s) matching given index key and value.

Parameters: `store.getByIndex(indexName, indexValue, callback)`

```js
people.getByIndex('email', 'bar@qux.com' }, (error, result) => console.log(error, result))
```

#### `.select`

Store method to get document(s) selecting by index, range and/or expected values.

Parameters: `store.select(indexName, rangeOptions, direction <optional>, callback)`

Range options can be expected values or have an object with following properties;
* `from`
* `to`
* `only`

```js
people.select('name', { from: 'a', to: 'e' }, (error, result) => {
    console.log(error, result)
    result.continue()
})
```

You can optionally choose direction parameter for getting results sorted. Direction paramters are:
* `prev` (descending)
* `next` (ascending)

```js
people.select('name', { from: 'a', to: 'e' }, 'prev', (error, result) => {
    console.log(error, result)
    result.continue()
})
```

Range options can be field keys, too. You can select by matching multiple fields at a time. Make sure having an index for the combination of the indexes though;

```js
const people = db.store('people', {
    key: { autoIncrement: true, keyPath: 'id' },
    indexes: [
        { name: 'age+country', fields: ['age', 'country'] }
    ]
})
```

Now we can select people by age and country:

```js
people.select('age+country', [20, 'jamaika'], (error, result) => {
    console.log(error, result)
    result.continue()
})
```

`from` and `to` options provides us more flexibility here:

```js
people.select('age+country', { from: [20, 'jamaika'], to: [30, 'jamaika'] }, (error, result) => {
    console.log(error, result)
    result.continue()
})
```

#### `.update`

Store method to update a document.

Parameters: `store.update(document, callback)`

```js
people.update({ id: 1, name: 'foo', email: 'hola@yolo.com' }, error => console.log(error))
```

#### `.delete`

Store method to delete a record.

Parameters: `store.delete(id, callback)`

```js
people.delete(1, error => console.log(error))
```

#### `.count`

Store method to count all records.

```js
people.count(error, count => console.log(error, count))
```

#### `.upgrade`

Store option to perform upgrade when there is a version change. It's an optional method.

```js
const people = db.store('people', {
    key: { autoIncrement: true, keyPath: 'id' },
    upgrade: upgrade
})

function upgrade () {
  people.createIndex('name', { unique: false })
}
```

#### Promises

If callback is not passed, a `Promise` will be returned. Here is an example;

```js
const rows = [{ name: 'foo' }, { name: 'bar' }, { name: 'qux' }]

Promise.all(rows.map(row => people.add(row))
```

Supported methods:

* add
* get
* getByIndex
* update
* delete

## Examples

See `test.js`
