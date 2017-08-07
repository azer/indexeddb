const http = require('http');
const url = require("url")

const hostname = '127.0.0.1';
const port = 3000;
const server = http.createServer(onRequest);
const stores = {}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})

function onRequest (req, resp) {
  const query = url.parse(req.url, true).query

  if (req.method !== 'POST') {
    return resp.end(JSON.stringify(filter(query)))
  }

  var body = "";

  req.on('data', function (chunk) {
    body += chunk;
  })

  req.on('end', function () {
    sync(JSON.parse(body))

    if (stores.people[4] == undefined) {
      stores.people[4] = {
        name: "pablo",
        email: "pablo@roadbeats.com",
        age: 40,
        tags: ['foobar'],
        createdAt: Date.now() + 1000
      }
    }
  })

  resp.end('{ "done": true, "time": ' + Date.now() + ' }');
}

function sync (updates) {
  updates.forEach(u => {
    if (!stores[u.store]) {
      stores[u.store] = {}
    }

    if (u.action === 'add') {
      u.doc.createdAt = Date.now()
      stores[u.store][u.documentId] = u.doc
      console.log('added ', JSON.stringify(u.doc))
    }

    if (u.action === 'update') {
      u.doc.updatedAt = Date.now()
      stores[u.store][u.documentId] = u.doc
      console.log('updated ', JSON.stringify(u.doc))
    }

    if (u.action === 'delete') {
      stores[u.store][u.documentId] = { deleted: true, deletedAt: Date.now() }
      console.log('deleted ', u.documentId)
    }
  })
}

function filter (options) {
  const ts = Number(options.ts || 0)
  const updates = []

  var name
  var id
  for (name in stores) {
    console.log(name)

    for (id in stores[name]) {
      if (stores[name][id].createdAt > ts) {
        updates.push({
          action: 'add',
          store: name,
          documentId: id,
          doc: stores[name][id]
        })
      }

      if (stores[name][id].lastUpdatedAt > ts) {
        updates.push({
          action: 'update',
          store: name,
          documentId: id,
          doc: stores[name][id]
        })
      }

      if (stores[name][id].deletedAt > ts) {
        updates.push({
          action: 'delete',
          store: name,
          documentId: id
        })
      }
    }
  }

  return updates
}
