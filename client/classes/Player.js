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

  calcMovement = () => {
    this.#addVelocity();
    this.#subtractVelocity();

    // we doing velocity in px/frame
    // actually kinda stupid cause velocity isnt velocity but anyways

    if (this.#velX < 0) this.#x += -f(Math.abs(this.#velX));
    if (this.#velX > 0) this.#x += f(Math.abs(this.#velX));
    if (this.#velY < 0) this.#y += -f(Math.abs(this.#velY));
    if (this.#velY > 0) this.#y += f(Math.abs(this.#velY));

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
