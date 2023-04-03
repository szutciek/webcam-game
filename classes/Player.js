const UserError = require("../utils/UserError");
const clients = require("../state/clients");

const maxS = 15;

const f = (x) => {
  // 2 is vert stretch, 1 is horizontal translation, using change of base
  return (10 * (15 * Math.log(x + 1))) / Math.log(8);
};

module.exports = class Player {
  previousPosition = undefined;
  updatedChunks = new Map();

  // CALCULATED ON SERVER
  velX = 0;
  velY = 0;
  position = {
    x: 0,
    y: 0,
    w: 100,
    h: 200,
  };

  // FROM CLIENT
  velocities = {
    x: 0,
    y: 0,
  };
  prediction = {
    x: 0,
    y: 0,
    w: 100,
    h: 200,
  };

  clientTicks = [];

  camera = "";

  pose = {
    crouching: false,
    madLeft: false,
    madRight: false,
  };

  constructor(uuid, position = { x: 0, y: 0, w: 100, h: 200 }, username) {
    this.uuid = uuid;
    this.position = position;
    this.prevPos = position;
    this.username = username;
  }

  updatePose(pose) {
    this.pose = pose;
  }

  addClientTick(tick) {
    // console.log("UPDATE");
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

  // think about the stuff again
  updatePrediction(position) {
    this.prediction = position;
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

  validateVelocity(velocities) {
    const validated = {};
    if (
      typeof velocities.x === "number" &&
      velocities.x <= 15 &&
      velocities.x >= -15
    ) {
      validated.x = velocities.x;
    } else if (Math.abs(velocities.x) > 15) {
      validated.x = 0;
    }
    if (
      typeof velocities.y === "number" &&
      velocities.y <= 15 &&
      velocities.y >= -15
    ) {
      validated.y = velocities.y;
    } else if (Math.abs(velocities.y) > 15) {
      validated.y = 0;
    }
    return validated;
  }

  validatePose(pose) {
    return pose;
  }

  // correctMovement(secondsPassed, currentTime) {
  //   if (!this.ticked) return false;
  //   // this value is the difference between tick on client and server
  //   const tickDelay = (currentTime - this.clientTimeStamp) / 1000;
  //   if (typeof tickDelay !== "number") tickDelay = 1;

  //   const timePassed = (currentTime - this.lastPosUpd) / 1000;

  //   if (tickDelay > 100) {
  //     console.log(tickDelay);
  //   }

  //   const posX =
  //     this.position.x +
  //     Math.sign(this.velX) * f(Math.abs(this.velX * timePassed));
  //   const posY =
  //     this.position.y +
  //     Math.sign(this.velY) * f(Math.abs(this.velY * timePassed));

  //   const possibleXmin = this.position.x - f(Math.abs(this.velX * timePassed));
  //   const possibleXmax = this.position.x + f(Math.abs(this.velX * timePassed));

  //   // console.log(
  //   //   Math.round(possibleXmin) <= Math.round(this.prediction.x) &&
  //   //     Math.round(possibleXmax) >= Math.round(this.prediction.x)
  //   // );
  //   console.log("TICK");

  //   const diffX =
  //     Math.abs(Math.round(posX)) - Math.abs(Math.round(this.prediction?.x));
  //   const diffY =
  //     Math.abs(Math.round(posY)) - Math.abs(Math.round(this.prediction?.y));

  //   this.lastPosUpd = currentTime;
  //   this.ticked = true;
  //   if (diffX < 30 && diffY < 30) {
  //     this.position.x = this.prediction.x;
  //     this.position.y = this.prediction.y;
  //     return false;
  //   } else {
  //     return {
  //       x: this.position.x,
  //       y: this.position.y,
  //       w: this.position.w,
  //       h: this.position.h,
  //     };
  //   }

  //   // if valid update prev pos and dont send override to client
  // }

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

    // const dispX = Math.abs(newestPos.x - this.position.x);
    // const dispY = Math.abs(newestPos.y - this.position.y);

    const validX =
      Math.abs(newestPos.x) <= Math.abs(this.position.x) + maxDispX + 30;
    const validY =
      Math.abs(newestPos.y) <= Math.abs(this.position.y) + maxDispY + 30;

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
