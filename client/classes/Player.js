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

  prevPos = undefined;

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
    document.addEventListener("keydown", (e) => {
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
    this.#x = lerp(this.#x, x, 0.2);
    this.#y = lerp(this.#y, y, 0.2);
    this.#w = w;
    this.#h = h;
  }

  rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x2 >= w1 + x1 || x1 >= w2 + x2 || y2 >= h1 + y1 || y1 >= h2 + y2) {
      return false;
    }
    return true;
  }

  sideIntersect(a, aL, b, bL) {
    // console.log(a, aL, b, bL);
    if (a < b + bL && a > b) {
      return Math.sign(a - (b + bL));
    }
    if (a + aL > b && a + aL < b + bL) {
      return Math.sign(a + aL - b);
    }
    if (a > b && a + aL < b + bL) {
      return Math.sign(a - b);
    }
    return false;
  }

  checkCollisions(currPos, obstacles, react = true) {
    if (!currPos || !obstacles)
      throw new Error("Incomplete data for collision detection");

    let horizontalCollision = false;

    const max = obstacles.length;
    for (let i = 0; i < max; i++) {
      if (
        this.rectIntersect(
          currPos.x,
          currPos.y,
          currPos.w,
          currPos.h,
          obstacles[i].xMap,
          obstacles[i].yMap,
          obstacles[i].w,
          obstacles[i].h
        ) === false
      ) {
        continue;
      }

      const oHit = {
        x: obstacles[i].xMap,
        y: obstacles[i].yMap,
        w: obstacles[i].w,
        h: obstacles[i].h,
      };

      const colHor = this.sideIntersect(currPos.x, currPos.w, oHit.x, oHit.w);
      const colVert = this.sideIntersect(currPos.y, currPos.h, oHit.y, oHit.h);

      if (colHor !== false) {
        const sign = Math.sign(-this.#velX);
        this.#velX = 0;
        let pos = currPos.x;

        for (let i = 0; i < 100; i++) {
          pos += sign;
          if (!this.sideIntersect(pos, currPos.w, oHit.x, oHit.w)) {
            this.#x = pos;
            break;
          }
        }
      }
      if (colVert !== false) {
        const sign = Math.sign(-this.#velY);
        this.#velY = 0;
        let pos = Math.round(currPos.y);

        for (let i = 0; i < 100; i++) {
          pos += sign;
          if (!this.sideIntersect(pos, currPos.h, oHit.y, oHit.h)) {
            this.#y = pos;
            break;
          }
        }
      }

      console.log(react);
      if (react === true) {
        if (this.#x + this.#w + 30 > oHit.x) {
          horizontalCollision = true;
          this.pose.madLeft = true;
        }
        if (this.#x - 25 < oHit.x + oHit.w) {
          console.log("yr");
          horizontalCollision = true;
          this.pose.madRight = true;
        }
      }
    }

    this.prevPos = currPos;

    if (!horizontalCollision) {
      // console.log("back");
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
