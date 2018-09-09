/**
 * Minimize IndexedDB request API to callbacks and promises. Example:
 *
 *  function get () {
 *    return createPromise(arguments, (callback, resolve, reject) => {
 *      returnResult(null, db.get(123), callback, resolve, reject)
 *    })
 *  }
 *
 */

module.exports = {
  returnResult,
  createPromise
}

function returnResult(err, request, callback, resolve, reject, push) {
  if (err) {
    ;(callback || reject)(err)
  }

  request.onerror = e => {
    if (callback) {
      callback(e.target.error)
    } else {
      reject(e.target.error)
    }
  }

  request.onsuccess = e => {
    if (callback) {
      callback(undefined, e.target.result)
    } else {
      resolve(e.target.result)
    }

    if (push) push(e.target.result)
  }
}

function createPromise(args, fn) {
  const cb = args[args.length - 1]
  if (typeof cb === "function") return fn(cb)

  return new Promise((resolve, reject) => fn(undefined, resolve, reject))
}
