const f = (x) => {
  // 2 is vert stretch, 1 is horizontal translation, using change of base
  return (10 * (15 * Math.log(x + 1))) / Math.log(8);
};

const lerp = (s, e, t) => {
  return (1 - t) * s + t * e;
};

export default class Player {
  shape = "player";

  velX = 0;
  velY = 0;

  animationMovement = {
    state: "idle",
    left: {
      disp: 0,
      returning: false,
    },
    right: {
      disp: 0,
      returning: false,
    },
  };

  constructor({ x, y, w, h }, info) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.username = info.username;
    this.camera = info?.camera;

    this.lastUpdate = new Date().getTime();
  }

  predictMovement(secondsPassed) {
    this.x += Math.sign(this.velX) * f(Math.abs(this.velX * secondsPassed));
    this.y += Math.sign(this.velY) * f(Math.abs(this.velY * secondsPassed));
  }

  updatePosition([x, y, w, h]) {
    this.prevX = this.x;
    this.prevY = this.y;

    this.x = lerp(this.x, x, 0.3);
    this.y = lerp(this.y, y, 0.3);
    this.w = w;
    this.h = h;

    this.lastUpdate = new Date().getTime();
    this.updateVelocities();
    this.updateAnimation();
  }

  updateVelocities() {
    this.velX = this.x - this.prevX;
    this.velY = this.y - this.prevY;
  }

  updateAnimation() {
    if (this.velX) {
      if (this.animationMovement.state === "idle") {
        if (this.velX < 0) {
          this.animationMovement.left.returning = true;
          this.animationMovement.left.disp = -30;
        } else {
          this.animationMovement.right.returning = true;
          this.animationMovement.right.disp = 30;
        }
      }

      this.animationMovement.state = "moving";

      if (this.animationMovement.left.returning) {
        this.animationMovement.left.disp -= this.velX / 2;
      } else {
        this.animationMovement.left.disp += this.velX / 10;
      }

      if (this.animationMovement.left.disp > 30) {
        this.animationMovement.left.disp = 30;
        if (!this.animationMovement.left.returning) {
          this.animationMovement.left.returning = true;
        } else {
          this.animationMovement.left.returning = false;
        }
      }
      if (this.animationMovement.left.disp < -30) {
        this.animationMovement.left.disp = -30;
        if (!this.animationMovement.left.returning) {
          this.animationMovement.left.returning = true;
        } else {
          this.animationMovement.left.returning = false;
        }
      }

      if (this.animationMovement.right.returning) {
        this.animationMovement.right.disp -= this.velX / 2;
      } else {
        this.animationMovement.right.disp += this.velX / 10;
      }

      if (this.animationMovement.right.disp > 30) {
        this.animationMovement.right.disp = 30;
        if (!this.animationMovement.right.returning) {
          this.animationMovement.right.returning = true;
        } else {
          this.animationMovement.right.returning = false;
        }
      }
      if (this.animationMovement.right.disp < -30) {
        this.animationMovement.right.disp = -30;
        if (!this.animationMovement.right.returning) {
          this.animationMovement.right.returning = true;
        } else {
          this.animationMovement.right.returning = false;
        }
      }
    } else {
      this.animationMovement = {
        state: "idle",
        left: {
          disp: 0,
          returning: false,
        },
        right: {
          disp: 0,
          returning: false,
        },
      };
    }
  }

  updatePose(pose) {
    console.log(pose.madLeft);
    this.pose = pose;
  }

  updateInfo(info) {
    if (info.username) this.username = info.username;
    if (info.camera) {
      this.camera = info.camera;
    }
  }
}
