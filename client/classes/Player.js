const maxX = 15;

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

  constructor(position = [0, 0, 100, 200]) {
    this.#x = position[0];
    this.#y = position[1];
    this.#w = position[2];
    this.#h = position[3];
  }

  #subtractVelocity = () => {
    if (!this.#inpS && !this.#inpN) {
      this.#velY /= 1.2;
    }
    if (!this.#inpW && !this.#inpE) {
      this.#velX /= 1.2;
    }
  };
  #addVelocity = () => {
    // if (this.#inpN && this.#velY < maxX) {
    //   this.#velY += 0.6;
    // }
    // if (this.#inpS && this.#velY > -maxX) {
    //   this.#velY -= 0.6;
    // }
    if (this.#inpN && this.#velY > -maxX) {
      this.#velY -= 0.6;
    }
    if (this.#inpS && this.#velY < maxX) {
      this.#velY += 0.6;
    }

    if (this.#inpE && this.#velX < maxX) {
      this.#velX += 0.6;
    }
    if (this.#inpW && this.#velX > -maxX) {
      this.#velX -= 0.6;
    }
  };

  activateMovement() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "w") {
        this.#inpN = true;
      }
      if (e.key === "s") {
        this.#inpS = true;
      }
      if (e.key === "a") {
        this.#inpW = true;
      }
      if (e.key === "d") {
        this.#inpE = true;
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "w") {
        this.#inpN = false;
      }
      if (e.key === "s") {
        this.#inpS = false;
      }
      if (e.key === "a") {
        this.#inpW = false;
      }
      if (e.key === "d") {
        this.#inpE = false;
      }
    });
  }
  deactivateMovement() {
    document.removeEventListener("keydown");
    document.removeEventListener("keyup");
  }

  checkCollisions(currPos, obstacles) {
    if (!currPos || !obstacles)
      throw new Error("Incomplete data for collision detection");

    const right = currPos.x + currPos.w;
    const left = currPos.x;
    const bottom = currPos.y + currPos.h;
    const top = currPos.y;

    for (const o of obstacles) {
      const colVert = top <= o.yMap + o.h && bottom >= o.yMap;
      const colHor = left <= o.xMap + o.w && right >= o.xMap;

      if (colHor && colVert) {
        // PREVENT ENTERING FROM TOP
        if (
          bottom >= o.yMap &&
          top <= o.yMap &&
          left >= o.xMap &&
          right <= o.xMap + o.w
        ) {
          this.#velY = 0;
          this.#y = o.yMap - currPos.h;
        }
        // PREVENT ENTERING FROM BOTTOM
        if (
          top <= o.yMap + o.h &&
          bottom >= o.yMap + o.h &&
          left >= o.xMap &&
          right <= o.xMap + o.w
        ) {
          this.#velY = 0;
          this.#y = o.yMap + o.h;
        }
        // PREVENT ENTERING FROM LEFT
        if (left <= o.xMap && right >= o.xMap) {
          this.#velX = 0;
          this.#x = o.xMap - currPos.w;
        }
        // PREVENT ENTERING FROM RIGHT
        if (right >= o.xMap + o.w && left <= o.xMap + o.w) {
          this.#velX = 0;
          this.#x = o.xMap + o.w;
        }
      }
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
