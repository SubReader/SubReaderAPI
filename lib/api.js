const SocketIOClient = require("socket.io-client");
const fetch = require("isomorphic-fetch");
const package = require("../package.json");

function request(resource, opts) {
  return fetch(package.config.endpoint + "/" + resource, opts)
    .then(function (res) { return res.json() })
    .then(function (json) {
      if (json.error) throw json.error;
      return json.data;
    });
}

function getAuthToken() {
  return request("auth/auth_token");
}

function getServiceToken(authToken) {
  return request("auth/access?auth_token=" + authToken);
}

function getStreamToken(serviceToken) {
  return request("streams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ service_token: serviceToken })
  });
}

function Stream(token, streamId) {
  this.id = streamId;
  this.socket = SocketIOClient(package.config.endpoint + "/server", {
    query: { token: token },
    transports: ["websocket"]
  });
}

Stream.prototype.setSubtitles = function setSubtitles(subtitles) {
  this.socket.emit("subtitles", subtitles);
}

Stream.prototype.setInfo = function setInfo(info) {
  this.socket.emit("info", info);
}

Stream.prototype.setState = function setState(state) {
  this.socket.emit("state", state);
}

module.exports = {
  getAuthToken: getAuthToken,
  getServiceToken: getServiceToken,
  getStreamToken: getStreamToken,
  Stream: Stream
};
