const UserError = require("../utils/UserError");
const clients = require("../state/clients");

class Room {
  #players = new Map();

  constructor(code) {
    this.code = code;
  }

  joinRoom(uuid) {
    // prevent overriding a room
    this.#players.set(uuid, { x: 0, y: 0, w: 100, h: 200 });
  }

  LeaveRoom(uuid) {
    this.#players.delete(uuid);
  }

  // might not work
  broadcast(message, uuid) {
    for (const id of Object.keys(this.#players)) {
      if (id !== uuid) {
        clients.find(id).ws.send(JSON.stringify(message));
      }
    }
  }

  get size() {
    return this.#clients.size;
  }
}

module.exports = new Clients();
