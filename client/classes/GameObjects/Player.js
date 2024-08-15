const f = (x) => {
  // 2 is vert stretch, 1 is horizontal translation, using change of base
  return (10 * (15 * Math.log(x + 1))) / Math.log(8);
};

const lerp = (s, e, t) => {
  return (1 - t) * s + t * e;
};

const clamp = (x, min, max) => {
  if (x < min) return min;
  if (x > max) return max;
  return x;
};

export default class Player {
  shape = "player";

  velX = 0;
  velY = 0;

  animationMovement = {
    state: "idle",
    left: {
      disp: 20,
      lift: 0,
      mult: 1,
    },
    right: {
      disp: -20,
      lift: 0,
      mult: -1,
    },
  };
  legRange = 30;
  legReturnProgress = 0;
  legReturnTime = 1;

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

  updatePosition([x, y, w, h], secondsPassed) {
    this.prevX = this.x;
    this.prevY = this.y;

    this.x = lerp(this.x, x, 0.3);
    this.y = lerp(this.y, y, 0.3);
    this.w = w;
    this.h = h;

    this.lastUpdate = new Date().getTime();
    this.updateVelocities();
    this.updateAnimation(secondsPassed);
  }

  updateVelocities() {
    this.velX = this.x - this.prevX;
    this.velY = this.y - this.prevY;
  }

  liftFunction = (x, isOnGround) => {
    if (isOnGround === true) return 0;
    if (x < -1) return 0;
    if (x > 1) return 0;
    return 10 * (x - 1) * (x + 1);
  };

  updateAnimation(delta) {
    const actualVelX = Math.abs(this.velX) < 1 ? 0 : this.velX;

    if (actualVelX === 0) {
      if (this.animationMovement.state === "moving") {
        this.legReturnProgress = 0;
        this.animationMovement.state = "idle";
      }

      if (this.legReturnProgress < this.legReturnTime) {
        const decimal = this.legReturnProgress / this.legReturnTime;
        const anim = this.animationMovement;

        const leftDelay = anim.left.lift > anim.right.lift ? 0.2 : 0;
        const rightDelay = anim.right.lift > anim.left.lift ? 0.2 : 0;

        anim.left.disp = lerp(
          anim.left.disp,
          -20,
          clamp(decimal - leftDelay, 0, 1)
        );
        anim.right.disp = lerp(
          anim.right.disp,
          20,
          clamp(decimal - rightDelay, 0, 1)
        );
        anim.left.lift = lerp(
          anim.left.lift,
          0,
          clamp(decimal - leftDelay, 0, 1)
        );
        anim.right.lift = lerp(
          anim.right.lift,
          0,
          clamp(decimal - rightDelay, 0, 1)
        );

        this.legReturnProgress += delta;
        return;
      }

      return;
    }

    const flip = actualVelX > 0 ? true : false;

    const anim = this.animationMovement;
    anim.state = "moving";
    const disp = Math.abs(actualVelX * 10 * delta);

    anim.left.disp += disp * anim.left.mult;
    const decimalL = anim.left.disp / this.legRange;
    const liftL = this.liftFunction(
      decimalL,
      flip ? anim.left.mult < 0 : anim.left.mult > 0
    );
    anim.left.lift = liftL;
    if (decimalL > 1) anim.left.mult = -1;
    if (decimalL < -1) anim.left.mult = 1;

    anim.right.disp += disp * anim.right.mult;
    const decimalR = anim.right.disp / this.legRange;
    const liftR = this.liftFunction(
      decimalR,
      flip ? anim.left.mult > 0 : anim.left.mult < 0
    );
    anim.right.lift = liftR;
    if (decimalR > 1) anim.right.mult = -1;
    if (decimalR < -1) anim.right.mult = 1;
  }

  updatePose(pose) {
    this.pose = pose;
  }

  updateInfo(info) {
    if (info.username) this.username = info.username;
    if (info.camera) {
      this.camera = info.camera;
    }
  }
}
