const UserError = require("../utils/UserError");
const clients = require("../state/clients");

const maxS = 15;
const errorMargin = 5;

const f = (x) => {
  // 2 is vert stretch, 1 is horizontal translation, using change of base
  return (10 * (15 * Math.log(x + 1))) / Math.log(8);
};

module.exports = class Player {
  shape = "player";

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

  rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
      return false;
    }
    return true;
  }

  correctMovement(secondsPassed, currentTime, objects = []) {
    if (this.clientTicks.length === 0) return false;

    let valid = true;

    const newestPos = this.clientTicks[0].position;
    const newestVel = this.clientTicks[0].velocities;
    const newestPose = this.clientTicks[0].pose;
    const newestTick = this.clientTicks[0].tick;
    const newestClientTime = this.clientTicks[0].relativeTimeStamp;

    // if client ahead of server
    if (newestClientTime >= currentTime) {
      valid = false;
    }

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
    if (clientTimeBetween < 0) {
      valid = false;
    }

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

    // loop over and check for collisions
    objects.forEach((object) => {
      // checks and overrides
      if (this.collisionDetectionSAT(object)) {
        valid = false;
      }
    });

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

  rectIntersect(
    x1,
    y1,
    w1,
    h1,
    x2 = this.position.x,
    y2 = this.position.y,
    w2 = this.position.w,
    h2 = this.position.h
  ) {
    if (x2 >= w1 + x1 || x1 >= w2 + x2 || y2 >= h1 + y1 || y1 >= h2 + y2) {
      return false;
    }
    return true;
  }

  collisionDetectionSAT(target) {
    try {
      if (target.shape === "rect" || target.shape === "player") {
        if (!target.colliding && target.shape !== "player") return;

        if (
          !this.rectIntersect(
            this.position.x,
            this.position.y,
            this.position.w,
            this.position.h,
            target.x,
            target.y,
            target.w,
            target.h
          )
        )
          return;

        const halfWidthPlayerX = this.position.w / 2;
        const halfWidthTargetX = target.w / 2;

        const centerPlayerX = this.position.x + halfWidthPlayerX;
        const centerTargetX = target.x + halfWidthTargetX;

        const diffX = centerTargetX - centerPlayerX;
        let gapX = diffX - halfWidthPlayerX - halfWidthTargetX;

        const halfWidthPlayerY = this.position.h / 2;
        const halfWidthTargetY = target.h / 2;

        const centerPlayerY = this.position.y + halfWidthPlayerY;
        const centerTargetY = target.y + halfWidthTargetY;

        const diffY = centerTargetY - centerPlayerY;
        let gapY = diffY - halfWidthPlayerY - halfWidthTargetY;

        const determineDisplacement = (
          gap,
          playerDimension,
          targetDimension
        ) => {
          let min = gap;

          const other = gap + playerDimension + targetDimension;
          if (other < Math.abs(min)) min = other;

          return min;
        };

        const xDisp = determineDisplacement(gapX, this.position.w, target.w);
        const yDisp = determineDisplacement(gapY, this.position.h, target.h);

        if (Math.abs(yDisp) < Math.abs(xDisp)) {
          this.velocities.velY = 0;
          this.position.y += yDisp;
        } else {
          this.velocities.velX = 0;
          this.position.x += xDisp;
        }

        // to override client
        return true;
      }
    } catch (err) {
      console.log(err);
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
