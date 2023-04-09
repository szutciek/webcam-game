module.exports = class GameMode {
  constructor(host, room) {
    this.host = host;
    this.room = room;
  }

  static get avalibleGameModes() {
    return ["open", "soccer"];
  }
};
