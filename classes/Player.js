const UserError = require("../utils/UserError");
const clients = require("../state/clients");

const maxS = 15;
const errorMargin = 8;

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

  sideIntersect(a, aL, b, bL) {
    if (a < b + bL && a > b) return true;
    if (a + aL > b && a + aL < b + bL) return true;
    if (a > b && a + aL < b + bL) return true;
    return false;
  }

  rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
      return false;
    }
    return true;
  }

  checkIfColliding(target) {
    return [
      this.sideIntersect(this.position.x, this.position.w, target.x, target.w),
      this.sideIntersect(this.position.y, this.position.h, target.y, target.h),
    ];
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
    this.velocities.x = vX;
    this.velocities.y = vY;

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

    let colliding = false;
    // loop over and check for collisions
    objects.forEach((object) => {
      const isColliding = this.collisionDetectionSAT(object);
      if (isColliding) colliding = true;
    });

    if (colliding === true) valid = false;

    const maxDispX = f(
      Math.abs((this.velocities.x * clientTimeBetween) / 1000)
    );
    const maxDispY = f(
      Math.abs((this.velocities.y * clientTimeBetween) / 1000)
    );

    const validX =
      Math.abs(newestPos.x) <=
      Math.abs(this.position.x) + maxDispX + errorMargin;
    const validY =
      Math.abs(newestPos.y) <=
      Math.abs(this.position.y) + maxDispY + errorMargin;

    if (!validX || !validY) {
      valid = false;
    }

    this.lastTickClientTime = newestClientTime;
    this.lastTickClient = newestTick;

    if (valid) {
      this.position.x = Math.round(newestPos.x * 10) / 10;
      this.position.y = Math.round(newestPos.y * 10) / 10;
      this.position.w = newestPos.w;
      this.position.h = newestPos.h;

      return false;
    } else {
      return {
        x: Math.round(this.position.x * 10) / 10,
        y: Math.round(this.position.y * 10) / 10,
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
        if (!target.colliding && target.shape !== "player") return false;

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
          return false;

        const halfWidthPlayerX = this.position.w / 2;
        const halfWidthTargetX = target.w / 2;

        const centerPlayerX = this.position.x + halfWidthPlayerX;
        const centerTargetX = target.x + halfWidthTargetX;

        const diffX = centerTargetX - centerPlayerX;
        const gapX = diffX - halfWidthPlayerX - halfWidthTargetX;

        const halfWidthPlayerY = this.position.h / 2;
        const halfWidthTargetY = target.h / 2;

        const centerPlayerY = this.position.y + halfWidthPlayerY;
        const centerTargetY = target.y + halfWidthTargetY;

        const diffY = centerTargetY - centerPlayerY;
        const gapY = diffY - halfWidthPlayerY - halfWidthTargetY;

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
          this.velocities.y = 0;
          this.position.y += yDisp;
        } else {
          this.velocities.x = 0;
          this.position.x += xDisp;
        }

        // to override client
        return true;
      }
    } catch (err) {
      throw err;
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
