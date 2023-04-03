const Room = require("../classes/Room");
const UserError = require("../utils/UserError");

class Rooms {
  #rooms = new Map();

  constructor() {}

  addRoom(code, map, creatorId, maxPlayers) {
    // prevent overriding a room
    if (this.#rooms.has(code))
      throw new UserError("This code is already in use!");

    if (!creatorId) {
      throw new UserError("Couldn't create room (no _id)");
    }

    const newRoom = new Room(code, map, creatorId, maxPlayers);
    this.#rooms.set(code, newRoom);
    return newRoom;
  }

  removeRoom(code) {
    this.#rooms.delete(code);
  }

  find(code) {
    return this.#rooms.get(code);
  }

  allRooms() {
    return this.#rooms;
  }

  get size() {
    return this.#rooms.size;
  }
}

module.exports = new Rooms();
