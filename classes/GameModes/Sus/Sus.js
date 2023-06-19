const GameMode = require("../GameMode.js");

module.exports = class Sus extends GameMode {
  mode = "sus";

  #inRound = false;
  #currentRoundPlayers = new Map();

  constructor(host, room) {
    super(host, room);
  }

  playerJoin(player) {
    if (this.#inRound === false) {
      this.#currentRoundPlayers.set(player.uuid, player);
    }
  }

  playerLeave(player) {}

  handleEvent(player, data) {}

  tick() {}

  get info() {
    return {};
  }
};
