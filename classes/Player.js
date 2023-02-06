const UserError = require("../utils/UserError");
const clients = require("../state/clients");

module.exports = class Player {
  previousPosition = undefined;
  updatedChunks = new Map();

  constructor(uuid, position) {
    this.uuid = uuid;
    this.position = position;
  }

  updatePosition([x, y, w, h]) {
    this.previousPosition = { ...this.position };
    this.position = { x, y, w, h, time: performance.now() };
    // add inventory and stuff in the future
  }

  get x() {
    return this.position.x;
  }
  get y() {
    return this.position.y;
  }
  get w() {
    return this.position.w;
  }
  get h() {
    return this.position.h;
  }
};
