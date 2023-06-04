const GameMode = require("./GameMode.js");

module.exports = class Open extends GameMode {
  mode = "shooterV1";

  constructor(host, room) {
    super(host, room);
  }

  tick() {}

  get info() {
    return {};
  }
};
