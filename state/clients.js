const UserError = require("../utils/UserError");
const { maxClients } = require("../config");

class Clients {
  #clients = new Map();

  addClient(client) {
    if (this.#clients.size > maxClients)
      throw new UserError("Too many players online. Please wait.");

    // prevent overriding a user (if another user tries to connect with it)
    if (this.#clients.has(client.uuid))
      throw new UserError("This uuid is already in use!");

    this.#clients.set(client.uuid, client);
  }

  removeClient(uuid) {
    this.#clients.delete(uuid);
  }

  broadcast(message, uuid) {
    for (const [id, client] of this.#clients) {
      if (id !== uuid) {
        client.sendTo(message);
      }
    }
  }

  alreadyOnline(id) {
    let online = false;
    this.#clients.forEach((cl) => {
      if (String(cl.user._id) === String(id)) {
        online = true;
      }
    });
    return online;
  }

  allClients() {
    return this.#clients;
  }

  find(uuid) {
    return this.#clients.get(uuid);
  }

  get size() {
    return this.#clients.size;
  }
}

module.exports = new Clients();
