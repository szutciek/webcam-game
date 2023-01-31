const UserError = require("../utils/UserError");
const rooms = require("../state/rooms");

module.exports = class Client {
  room = undefined;

  constructor(uuid, user, ws) {
    this.uuid = uuid;
    this.user = user;
    this.ws = ws;
  }

  changeRoom(code) {
    this.leaveRoom();
    this.joinRoom(code);
  }

  joinRoom(code) {
    this.room = code;
    rooms.find(code)?.joinRoom(this.uuid);
    this.roomRef = rooms.find(code);
  }

  leaveRoom() {
    if (!this.room) return;
    rooms.find(this.room)?.leaveRoom(this.uuid);
    this.room = undefined;
    this.roomRef = undefined;
  }

  sendTo(message) {
    this.ws.send(JSON.stringify(message));
  }
};
