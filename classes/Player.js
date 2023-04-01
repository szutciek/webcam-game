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

  pose = {
    crouching: false,
    madLeft: false,
    madRight: false,
  };

  constructor(uuid, position = { x: 0, y: 0, w: 100, h: 200 }, username) {
    this.uuid = uuid;
    this.position = position;
    this.username = username;
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

  // think about the stuff again
  updatePrediction(position, timeStamp) {
    this.prediction = position;
    this.timeStamp = timeStamp;
  }

  updateVelocity(velocities) {
    if (
      typeof velocities.x === "number" &&
      velocities.x <= 15 &&
      velocities.x >= -15
    ) {
      this.velX = velocities.x;
    } else if (Math.abs(velocities.x) > 15) {
      this.velX = 0;
    }

    if (
      typeof velocities.y === "number" &&
      velocities.y <= 15 &&
      velocities.y >= -15
    ) {
      this.velY = velocities.y;
    } else if (Math.abs(velocities.y) > 15) {
      this.velY = 0;
    }
  }

  calculateMovement(secondsPassed) {
    if (this.velX < 0) this.position.x += this.velX;
    if (this.velX > 0) this.position.x += this.velX;
    if (this.velY < 0) this.position.y += this.velY;
    if (this.velY > 0) this.position.y += this.velY;

    console.log(this.timeStamp);

    // adjusting for the time it takes to transmit
    this.position.x +=
      Math.sign(this.velX) * f(Math.abs(this.velX * secondsPassed));
    this.position.y +=
      Math.sign(this.velY) * f(Math.abs(this.velY * secondsPassed));
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
      username: this.username,
      pose: this.pose,
    };
    if (camera) data.camera = this.camera;
    return data;
  }
};
