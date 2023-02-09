const maxS = 15;

const f = (x) => {
  // 2 is vert stretch, 1 is horizontal translation, using change of base
  return (15 * Math.log(x + 1)) / Math.log(8);
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

  constructor(position = [0, 0, 100, 200]) {
    this.#x = position[0];
    this.#y = position[1];
    this.#w = position[2];
    this.#h = position[3];
  }

  #subtractVelocity = () => {
    if (!this.pose.crouching) {
      if (!this.#inpS && !this.#inpN) {
        this.#velY /= 1.2;
      }
      if (!this.#inpW && !this.#inpE) {
        this.#velX /= 1.2;
      }
    } else {
      if (!this.#inpS && !this.#inpN) {
        this.#velY /= 1.7;
      }
      if (!this.#inpW && !this.#inpE) {
        this.#velX /= 1.7;
      }
    }
  };
  #addVelocity = () => {
    // if (this.#inpN && this.#velY < maxX) {
    //   this.#velY += 0.6;
    // }
    // if (this.#inpS && this.#velY > -maxX) {
    //   this.#velY -= 0.6;
    // }

    let currentMax = maxS;
    if (this.pose.crouching) currentMax /= 20;

    if (this.#inpN && this.#velY > -currentMax) {
      this.#velY -= 0.6;
    }
    if (this.#inpS && this.#velY < currentMax) {
      this.#velY += 0.6;
    }

    if (this.#inpE && this.#velX < currentMax) {
      this.#velX += 0.6;
    }
    if (this.#inpW && this.#velX > -currentMax) {
      this.#velX -= 0.6;
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

  calcMovement = (obstacles) => {
    this.#addVelocity();
    this.#subtractVelocity();

    // we doing velocity in px/frame
    // actually kinda stupid cause velocity isnt velocity but anyways

    if (this.#velX < 0) this.#x += -f(Math.abs(this.#velX));
    if (this.#velX > 0) this.#x += f(Math.abs(this.#velX));
    if (this.#velY < 0) this.#y += -f(Math.abs(this.#velY));
    if (this.#velY > 0) this.#y += f(Math.abs(this.#velY));

    this.checkCollisions(
      { x: this.#x, y: this.#y, w: this.#w, h: this.#h },
      obstacles
    );

    // this.#x += this.#velX;
    // this.#y += this.#velY;

    document.getElementById("position").innerText = `${Math.floor(
      this.#x
    )}, ${Math.floor(this.#y)}`;
  };

  syncMovement() {
    currentSync.syncPosition(this.#x, this.#y);
  }

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
}
