const Room = require("../classes/Room");
const UserError = require("../utils/UserError");

class Rooms {
  #rooms = new Map();

  addRoom(code) {
    // prevent overriding a room
    if (this.#rooms.has(code))
      throw new UserError("This code is already in use!");

    this.#rooms.set(code, new Room(code));
  }

  removeRoom(code) {
    this.#rooms.delete(code);
  }

  get size() {
    return this.#clients.size;
  }
}

module.exports = new Clients();
