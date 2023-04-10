const UserError = require("../utils/UserError");
const rooms = require("../state/rooms");

module.exports = class Client {
  room = undefined;
  roomRef = undefined;

  constructor(uuid, user, ws) {
    this.uuid = uuid;
    this.user = user;
    this.ws = ws;
  }

  changeRoom(code) {
    this.leaveRoom();

    this.room = code;
    this.roomRef = rooms.find(code);
  }

  // breaks because player created on room join method
  // joinRoom(code) {
  //   this.room = code;
  //   rooms.find(code)?.joinRoom(this.uuid);
  //   this.roomRef = rooms.find(code);
  // }

  leaveRoom() {
    if (!this.room) return;
    const room = rooms.find(this.room);
    room?.leaveRoom(this.uuid);
    if (room.isEmpty) rooms.removeRoom(this.room);
    this.room = undefined;
    this.roomRef = undefined;
  }

  sendTo(message) {
    this.ws.send(JSON.stringify(message));
  }
};
