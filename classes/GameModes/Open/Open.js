const GameMode = require("../GameMode.js");

module.exports = class Open extends GameMode {
  mode = "open";

  constructor(host, room) {
    super(host, room);
  }

  handleEvent(player, data) {}

  tick() {}

  get info() {
    return {};
  }
};
