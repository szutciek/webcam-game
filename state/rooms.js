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

  publicRoomData() {
    const list = [];
    this.#rooms.forEach((room) => {
      const playerList = [];
      let creatorUsername = undefined;
      room.players.forEach((player) => {
        if (player.user._id === room.creatorId) {
          creatorUsername = player.user.username;
        }
        playerList.push({
          uuid: player.uuid,
          username: player.username,
        });
      });

      list.push({
        code: room.code,
        map: room.map,
        gameMode: room.game.mode,
        creator: creatorUsername,
        players: playerList,
      });
    });
    return list;
  }

  get size() {
    return this.#rooms.size;
  }
}

module.exports = new Rooms();
