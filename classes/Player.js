const UserError = require("../utils/UserError");
const clients = require("../state/clients");

const maxS = 15;

const f = (x) => {
  // 2 is vert stretch, 1 is horizontal translation, using change of base
  return (15 * Math.log(x + 1)) / Math.log(8);
};

module.exports = class Player {
  previousPosition = undefined;
  updatedChunks = new Map();

  velX = 0;
  velY = 0;

  camera = "";
  inputs = {
    n: false,
    e: false,
    s: false,
    w: false,
  };
  pose = {
    crouching: false,
    madLeft: false,
    madRight: false,
  };

  constructor(uuid, position = { x: 0, y: 0, w: 100, h: 200 }) {
    this.uuid = uuid;
    this.position = position;
  }

  // client not gonna override anymore
  // updatePosition([x, y, w, h]) {
  //   this.previousPosition = { ...this.position };
  //   this.position = { x, y, w, h, time: performance.now() };
  //   // add inventory and stuff in the future
  // }

  updatePose(pose) {
    this.pose = pose;
  }

  updateInputs(inputs) {
    this.inputs = inputs;
  }

  calculateVelocity() {
    let currentMax = maxS;
    if (this.pose.crouching) currentMax /= 20;

    if (this.inputs.n && this.velY > -currentMax) {
      this.velY -= 0.6;
    }
    if (this.inputs.s && this.velY < currentMax) {
      this.velY += 0.6;
    }

    if (this.inputs.e && this.velX < currentMax) {
      this.velX += 0.6;
    }
    if (this.inputs.w && this.velX > -currentMax) {
      this.velX -= 0.6;
    }

    if (!this.pose.crouching) {
      if (!this.inputs.s && !this.inputs.n) {
        this.velY /= 1.2;
      }
      if (!this.inputs.w && !this.inputs.e) {
        this.velX /= 1.2;
      }
    } else {
      if (!this.inputs.s && !this.inputs.n) {
        this.velY /= 1.7;
      }
      if (!this.inputs.w && !this.inputs.e) {
        this.velX /= 1.7;
      }
    }
  }

  calculateMovement() {
    this.position.x += Math.sign(this.velX) * f(Math.abs(this.velX));
    this.position.y += Math.sign(this.velY) * f(Math.abs(this.velY));
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
