module.exports = class GameMode {
  constructor(host, room) {
    this.host = host;
    this.room = room;
  }

  playerJoin(player) {}

  playerLeave(player) {}

  handleEvent(player, data) {}

  tick() {}

  get info() {
    return {};
  }

  static get avalibleGameModes() {
    return ["open", "soccer", "shooterV1", "sus"];
  }
};
