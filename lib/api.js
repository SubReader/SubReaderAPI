const SocketIOClient = require("socket.io-client");
const fetch = require("isomorphic-fetch");
const { config } = require("../package.json");

function request(resource, opts) {
  return fetch(`${config.endpoint}/${resource}`, opts)
    .then(res => res.json())
    .then(json => {
      if (json.error) throw json.error;
      return json.data;
    });
}

function getAuthToken() {
  return request("auth/auth_token");
}

function getServiceToken(authToken) {
  return request(`auth/access?auth_token=${authToken}`);
}

function getStreamToken(serviceToken) {
  return request(`streams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ service_token: serviceToken })
  });
}

class Stream {
  constructor(token, streamId) {
    this.id = streamId;
    this.socket = SocketIOClient(`${config.endpoint}/server`, {
      query: { token },
      transports: ["websocket"]
    });
  }
  setSubtitles(subtitles) {
    this.socket.emit("subtitles", subtitles);
  }
  setInfo(info) {
    this.socket.emit("info", info);
  }
  setState(state) {
    this.socket.emit("state", state);
  }
}

async function getStream(onId) {
  const { token: authToken, id: authId } = await getAuthToken();
  onId(authId);
  const serviceToken = await getServiceToken(authToken);
  const { token, id: streamId } = await getStreamToken(serviceToken);
  return new Stream(token, streamId);
}

module.exports = {
  getAuthToken,
  getServiceToken,
  getStreamToken,
  Stream,
  getStream
};
