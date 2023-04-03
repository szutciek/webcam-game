const maxS = 15;
const diff = 1;

const f = (x) => {
  // 2 is vert stretch, 1 is horizontal translation, using change of base
  return (10 * (15 * Math.log(x + 1))) / Math.log(8);
};

const lerp = (s, e, t) => {
  return (1 - t) * s + t * e;
};

export default class Player {
  #x = 0;
  #y = 0;

  #w = 100;
  #h = 200;

  #velX = 0;
  #velY = 0;

  #inpE = false;
  #inpW = false;
  #inpN = false;
  #inpS = false;

  pose = {
    crouching: false,
    madLeft: false,
    madRight: false,
  };

  lastTimeStamp = undefined;

  constructor(position = [0, 0, 100, 200], username = "Anonymous") {
    this.#x = position[0];
    this.#y = position[1];
    this.#w = position[2];
    this.#h = position[3];

    this.username = username;
  }

  subtractVelocity = () => {
    if (!this.pose.crouching) {
      if (!this.#inpS && !this.#inpN) {
        this.#velY = lerp(this.#velY, 0, 0.1);
      }
      if (!this.#inpW && !this.#inpE) {
        this.#velX = lerp(this.#velX, 0, 0.1);
      }
    } else {
      if (!this.#inpS && !this.#inpN) {
        this.#velY = lerp(this.#velY, 0, 0.3);
      }
      if (!this.#inpW && !this.#inpE) {
        this.#velX = lerp(this.#velX, 0, 0.3);
      }
    }
  };
  addVelocity = () => {
    let currentMax = maxS;
    if (this.pose.crouching) currentMax /= 20;

    if (this.#inpN && this.#velY > -currentMax) {
      this.#velY -= diff;
    }
    if (this.#inpS && this.#velY < currentMax) {
      this.#velY += diff;
    }
    if (this.#inpE && this.#velX < currentMax) {
      this.#velX += diff;
    }
    if (this.#inpW && this.#velX > -currentMax) {
      this.#velX -= diff;
    }

    if (Math.abs(this.#velX) > currentMax) {
      this.#velX = Math.sign(this.#velX) * currentMax;
    }
    if (Math.abs(this.#velY) > currentMax) {
      this.#velY = Math.sign(this.#velY) * currentMax;
    }

    if (Math.abs(this.#velX) < 0.1) {
      this.#velX = 0;
    }
    if (Math.abs(this.#velY) < 0.1) {
      this.#velY = 0;
    }
  };

  activateMovement() {
    document.addEventListener("keypress", (e) => {
      // e.stopPropagation();
      // e.preventDefault();
    });
    document.addEventListener("keydown", (e) => {
      // e.stopPropagation();
      // e.preventDefault();

      if (e.key === "w" || e.key === "W") {
        this.#inpN = true;
      }
      if (e.key === "s" || e.key === "S") {
        this.#inpS = true;
      }
      if (e.key === "a" || e.key === "A") {
        this.#inpW = true;
      }
      if (e.key === "d" || e.key === "D") {
        this.#inpE = true;
      }

      // SPECIAL KEYS
      if (e.key === "Shift") {
        this.pose.crouching = true;

        // // doesnt work with current collisions
        // if (this.#h !== 150) this.#y += 50;
        // this.#h = 150;
      }
    });
    document.addEventListener("keyup", (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (e.key === "w" || e.key === "W") {
        this.#inpN = false;
      }
      if (e.key === "s" || e.key === "S") {
        this.#inpS = false;
      }
      if (e.key === "a" || e.key === "A") {
        this.#inpW = false;
      }
      if (e.key === "d" || e.key === "D") {
        this.#inpE = false;
      }

      // SPECIAL KEYS
      if (e.key === "Shift") {
        this.pose.crouching = false;

        // // doesnt work with current collisions
        // if (this.#h !== 200 && this.nothing50Above()) {
        //   this.#y -= 50;
        // }
        // this.#h = 200;
      }
    });
  }
  deactivateMovement() {
    document.removeEventListener("keydown");
    document.removeEventListener("keyup");
    document.removeEventListener("keypress");
  }

  serverOverride({ x, y, w, h }) {
    this.#x = lerp(this.#x, x, 0.3);
    this.#y = lerp(this.#y, y, 0.3);
    this.#w = w;
    this.#h = h;
  }

  checkCollisions(currPos, obstacles, react = false) {
    if (!currPos || !obstacles)
      throw new Error("Incomplete data for collision detection");

    const right = currPos.x + currPos.w;
    const left = currPos.x;
    const bottom = currPos.y + currPos.h;
    const top = currPos.y;

    let horizontalCollision = false;

    for (const o of obstacles) {
      const colVert = top <= o.yMap + o.h && bottom >= o.yMap;
      const colHor = left <= o.xMap + o.w && right >= o.xMap;

      if (colHor && o.ignore) horizontalCollision = true;

      if (!o.ignore && colHor && colVert) {
        horizontalCollision = true;

        if (
          bottom <= o.yMap + o.h &&
          bottom >= o.yMap &&
          right - 25 > o.xMap &&
          left + 25 < o.xMap + o.w
        ) {
          this.#velY = 0;
          this.#y = o.yMap - currPos.h;
        }

        if (
          top <= o.yMap + o.h &&
          top >= o.yMap &&
          right - 25 > o.xMap &&
          left + 25 < o.xMap + o.w
        ) {
          this.#velY = 0;
          this.#y = o.yMap + o.h;
        }

        if (
          right <= o.xMap + o.w &&
          right >= o.xMap &&
          bottom - 25 > o.yMap &&
          top + 25 < o.yMap + o.h
        ) {
          this.#velX = 0;
          this.#x = o.xMap - currPos.w;
          // react to the right
          react && (this.pose.madRight = true);
        }

        if (
          left <= o.xMap + o.w &&
          left >= o.xMap &&
          bottom - 25 > o.yMap &&
          top + 25 < o.yMap + o.h
        ) {
          this.#velX = 0;
          this.#x = o.xMap + o.w;
          // react to the left
          react && (this.pose.madLeft = true);
        }
      }
    }

    if (!horizontalCollision) {
      this.pose.madLeft = false;
      this.pose.madRight = false;
    }
  }

  performMovement = (secondsPassed) => {
    this.#x += Math.sign(this.#velX) * f(Math.abs(this.#velX * secondsPassed));
    this.#y += Math.sign(this.#velY) * f(Math.abs(this.#velY * secondsPassed));

    document.getElementById("position").innerText = `${Math.floor(
      this.#x
    )}, ${Math.floor(this.#y)}`;
  };

  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  get w() {
    return this.#w;
  }
  get h() {
    return this.#h;
  }
  get velX() {
    return this.#velX;
  }
  get velY() {
    return this.#velY;
  }
  get position() {
    return {
      x: this.#x,
      y: this.#y,
      w: this.#w,
      h: this.#h,
    };
  }
  get velocities() {
    return {
      x: this.#velX,
      y: this.#velY,
    };
  }
  get inputs() {
    return {
      n: this.#inpN,
      e: this.#inpE,
      s: this.#inpS,
      w: this.#inpW,
    };
  }
}
