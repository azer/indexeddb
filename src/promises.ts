export function returnResult(err, request, callback, resolve?, reject?, push?) {
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

export function createPromise(args, fn) {
  const cb = args[args.length - 1]
  if (typeof cb === "function") return fn(cb)

  return new Promise((resolve, reject) => fn(undefined, resolve, reject))
}
