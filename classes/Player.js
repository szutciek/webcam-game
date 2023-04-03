const UserError = require("../utils/UserError");
const clients = require("../state/clients");

const maxS = 15;
const errorMargin = 5;

const f = (x) => {
  // 2 is vert stretch, 1 is horizontal translation, using change of base
  return (10 * (15 * Math.log(x + 1))) / Math.log(8);
};

module.exports = class Player {
  updatedChunks = new Map();

  position = {
    x: 0,
    y: 0,
    w: 100,
    h: 200,
  };
  velocities = {
    x: 0,
    y: 0,
  };
  pose = {
    crouching: false,
    madLeft: false,
    madRight: false,
  };
  camera = "";

  clientTicks = [];

  constructor(uuid, position = { x: 0, y: 0, w: 100, h: 200 }, username) {
    this.uuid = uuid;
    this.position = position;
    this.username = username;
  }

  updatePose(pose) {
    this.pose = pose;
  }

  addClientTick(tick) {
    this.clientTicks.length = 10;
    this.clientTicks.unshift({
      velocities: tick.velocities,
      position: tick.position,
      pose: tick.pose,
      tick: tick.tick,
      relativeTimeStamp: tick.relativeTimeStamp,
    });
  }

  updateClientInfo(time, tick) {
    this.clientTimeStamp = time;
    this.clientTick = tick;
  }

  validateVelocity(velocities) {
    const validated = {};
    if (
      typeof velocities.x === "number" &&
      velocities.x <= maxS &&
      velocities.x >= -maxS
    ) {
      validated.x = velocities.x;
    } else if (Math.abs(velocities.x) > maxS) {
      validated.x = 0;
    }
    if (
      typeof velocities.y === "number" &&
      velocities.y <= maxS &&
      velocities.y >= -maxS
    ) {
      validated.y = velocities.y;
    } else if (Math.abs(velocities.y) > maxS) {
      validated.y = 0;
    }
    return validated;
  }

  validatePose(pose) {
    return pose;
  }

  correctMovement(secondsPassed, currentTime) {
    if (this.clientTicks.length === 0) return false;

    let valid = true;

    const newestPos = this.clientTicks[0].position;
    const newestVel = this.clientTicks[0].velocities;
    const newestPose = this.clientTicks[0].pose;
    const newestTick = this.clientTicks[0].tick;
    const newestClientTime = this.clientTicks[0].relativeTimeStamp;

    // if client ahead of server
    if (newestClientTime >= currentTime) valid = false;

    // validate pose
    const pose = this.validatePose(newestPose);
    this.pose = pose;

    // validate velocities so never exceed 15
    const { x: vX, y: vY } = this.validateVelocity(newestVel);
    this.vX = vX;
    this.vY = vY;

    const lastClientTick = this.clientTicks.find(
      (t) => t?.tick === this.lastTickClient
    );

    let lastTickClientTime;
    if (lastClientTick === undefined) {
      // artificial time
      lastTickClientTime = 0;
    } else {
      lastTickClientTime = lastClientTick.relativeTimeStamp;
    }

    // time between the tick that determined current position and new position
    const clientTimeBetween = newestClientTime - lastTickClientTime;

    // if there is no delay than something is wrong
    if (clientTimeBetween < 0) valid = false;

    if (clientTimeBetween > 100) {
      clients.find(this.uuid).sendTo({
        type: "latwarn",
        latency: clientTimeBetween,
      });
    }

    const maxDispX = f(Math.abs((this.vX * clientTimeBetween) / 1000));
    const maxDispY = f(Math.abs((this.vY * clientTimeBetween) / 1000));

    const validX =
      Math.abs(newestPos.x) <=
      Math.abs(this.position.x) + maxDispX + errorMargin;
    const validY =
      Math.abs(newestPos.y) <=
      Math.abs(this.position.y) + maxDispY + errorMargin;

    if (!validX || !validY) valid = false;

    this.lastTickClientTime = newestClientTime;
    this.lastTickClient = newestTick;
    if (valid) {
      this.position.x = newestPos.x;
      this.position.y = newestPos.y;
      this.position.w = newestPos.w;
      this.position.h = newestPos.h;

      return false;
    } else {
      return {
        x: this.position.x,
        y: this.position.y,
        w: this.position.w,
        h: this.position.h,
      };
    }
  }

  checkCollision(hitbox) {
    const cX = hitbox.x;
    const cY = hitbox.y;
    const cH = hitbox.h;
    const cW = hitbox.w;

    const pX = this.position.x;
    const pY = this.position.y;
    const pH = this.position.h;
    const pW = this.position.w;

    // const colVert = top <= o.yMap + o.h && bottom >= o.yMap;
    const colVert = cY <= pY + pH && cY + cH >= pY;
    const colHor = cX <= pX + pW && cX + cW >= pX;

    return colHor && colVert;
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
