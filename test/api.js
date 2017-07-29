module.exports = {
  get,
  post,
  put,
  delete: rdelete
}

function sendJSON (method, url, data, callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open(method, url);

  if (data) {
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(data));
  } else {
    xmlhttp.send(null);
  }

  xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState !== 4) {
      return
    }

    const parsed = JSON.parse(xmlhttp.responseText)
    if (xmlhttp.status >= 300 && parsed && parsed.error) {
      return callback(new Error(parsed.error))
    }

    if (xmlhttp.status >= 300) {
      return callback(new Error('Request error: ' + xmlhttp.status))
    }

    callback(undefined, parsed)
  }
}

function get (url, callback) {
  sendJSON('GET', url, null, callback)
}

function post (url, data, callback) {
  sendJSON('POST', url, data, callback)
}

function put (url, data, callback) {
  sendJSON('PUT', url, data, callback)
}

function rdelete (url, data, callback) {
  sendJSON('DELETE', url, data, callback)
}
