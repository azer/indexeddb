## indexeddb

Low-level Minimalistic wrapper for HTML5 IndexedDB API.

## Install

```bash
$ npm install azer/indexeddb
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
        { name: 'email', options: { unique: true } }
    ]
})
```

#### `.add`

Store method to add documents.

Parameters: `store.add(document, callback)`

```js
people.add({ name: 'foo', email: 'bar@qux.com' }, error => console.log(error))
```

#### `.get`

Store method to get a document by key value.

Parameters: `store.get(id, callback)`

#### `.select`

Store method to get document(s) matching given index key and value.

Parameters: `store.select(indexName, indexValue, callback)`

```js
people.select('email', 'bar@qux.com' }, (error, result) => console.log(error, result))
```

#### `.selectRange`

Store method to get document(s) selecting by index and range.

Parameters: `store.selectRange(indexName, rangeOptions, callback)`

Range options must have at least one of these properties:
* from
* to
* only

```js
people.selectRange('name', { from: 'a', to: 'e' }, (error, result) => console.log(error, result))
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

## Examples

See `test.js`
