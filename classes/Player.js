const UserError = require("../utils/UserError");
const clients = require("../state/clients");

module.exports = class Player {
  previousPosition = undefined;
  updatedChunks = new Map();

  camera = "";
  pose = {
    crouching: false,
    madLeft: false,
    madRight: false,
  };

  constructor(uuid, position) {
    this.uuid = uuid;
    this.position = position;
  }

  updatePosition([x, y, w, h]) {
    this.previousPosition = { ...this.position };
    this.position = { x, y, w, h, time: performance.now() };
    // add inventory and stuff in the future
  }
  updatePose(pose) {
    this.pose = pose;
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

  quickData(camera) {
    const data = {
      id: this.uuid,
      position: [
        Math.floor(this.position.x),
        Math.floor(this.position.y),
        this.position.w,
        this.position.h,
      ],
      pose: this.pose,
    };
    if (camera) data.camera = this.camera;
    return data;
  }
};
