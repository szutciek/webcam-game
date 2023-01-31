const UserError = require("../utils/UserError");
const { maxClients } = require("../config");

class Clients {
  #clients = new Map();

  addClient(uuid, user, ws) {
    if (this.#clients.size >= maxClients)
      throw new UserError("Too many players online. Please wait.");

    // prevent overriding a user (if another user tries to connect with it)
    if (this.#clients.has(uuid))
      throw new UserError("This uuid is already in use!");

    this.#clients.set(uuid, { user, ws });
  }

  removeClient(uuid) {
    this.#clients.delete(uuid);
  }

  get size() {
    return this.#clients.size;
  }
}

module.exports = new Clients();
