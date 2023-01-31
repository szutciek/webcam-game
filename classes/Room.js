const UserError = require("../utils/UserError");
const clients = require("../state/clients");

module.exports = class Room {
  #players = new Map();

  constructor(code) {
    this.code = code;
  }

  joinRoom(uuid) {
    this.#players.set(uuid, { x: 0, y: 0, w: 100, h: 200 });
  }

  leaveRoom(uuid) {
    this.#players.delete(uuid);
  }

  updatePlayerPosition(uuid, [x, y]) {
    const player = this.#players.get(uuid);
    player.x = x;
    player.y = y;
    this.#players.set(uuid, player);
  }

  updatePlayerCamera(uuid, data) {
    const player = this.#players.get(uuid);
    player.camera = data;
    this.#players.set(uuid, player);
  }

  inside(uuid) {
    return this.#players.has(uuid);
  }

  broadcast(message, uuid) {
    for (const [id, client] of clients.allClients()) {
      if (client.room === this.code) {
        if (id !== uuid) {
          client.sendTo(message);
        }
      }
    }
  }

  get size() {
    return this.#players.size;
  }
};
