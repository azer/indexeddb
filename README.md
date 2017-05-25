## indexeddb

Well-tested, low-level wrapper around the IndexedDB API. Now it supports synchronization, too.

See `test.js` for examples.

## Install

```bash
$ npm install kaktus/indexeddb
```

## API

* [Stores](#stores)
  * [.add](#add)
  * [.all](#all)
  * [.get](#get)
  * [.getByIndex](#getByIndex)
  * [.select](#select)
  * [.update](#update)
  * [.delete](#delete)
  * [.count](#count)
  * [.upgrade](#upgrade)
  * [Promises](#promises)
* [Synchronization](#synchronization)
  * [Local](#local)
  * [Remote](#remote)

## Stores

Define a store for each data type. Stores will have following methods;

```js
const db = require('indexeddb')('mydb', {
    version: 1
})

// Create your stores before opening the connection
const people = db.store('people', {
    // you can choose custom key optionally by: "key: { options}"
    indexes: [
      { name: 'email', options: { unique: true } },
      'age',
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

## Synchronization

### Local

You can use the sync method to keep multiple local indexeddb database instances easily.

```js
const a = require('indexeddb')('local', {
  version: 1
})

const b = require('indexeddb')('local', {
  version: 1
})

const c = require('indexeddb')('local', {
  version: 1
})

a.sync(b)
a.sync(c)
```

That's it! Now all three local databases will be in sync automatically.

### Remote

You can sync your IndexedDB remotely. To accomplish this, you'll need to
customize *Push* and *Pull* classes. Both of these classes pass eachother update objects. Here is an example update object;

```
{
  action: 'add',
  store: 'articles',
  id: 1,
  doc: {
    title: 'hello world',
    content: 'lorem ipsum ...'
  }
}
```

#### Customizing `Push`

The Push class takes updates from a source and sends them to the target.
If we are syncing an IndexedDB instance with a remote API, then we'll tweak
this class to take updates from the API and simply pass it to the `add` method.

```js
const Push = require('indexeddb/lib/push')

class APIPush extends Push {
  constructor() {
    super()

    this.checkForUpdates()
  }

  checkForUpdates() {
    myapi.get("/sync", resp => {
      this.add(resp.updates)

      setTimeout(() => this.checkForUpdates(), 1000) // keep checking for updates
    })
  }
}
```

#### Customizing `Pull`

The Pull class takes updates from a foreign database and copies it to the database it belongs to.
In this example, we'll customize the `copy` method to send the updates we get to the server.

```js
const Pull = require('indexeddb/lib/pull')

class APIPull extends Pull {
  constructor() {
    super()
    this.intervalMS = 1000 // Default is 50, too low for APIs.
  }

  copy(updates) {
    updates.forEach(function (update) {
      if (update.action == "add" && update.store == "articles") {
        myapi.put("/articles", options.doc, function (error) {})
      }
    })
  }
}
```

#### Custom Synchronization

After we defined the custom Push & Pull functions, we are ready to hook them.
Simply create an object of these two and pass it to the sync method of the database
that you want to sync with. Check the example below;

```js
const local = require('indexeddb')('local', {
  version: 1
})

local.sync({
  pull: new APIPush,
  push: new APIPull
})
```

## Examples

See `test.js`
