import GameObject from "/classes/GameObjects/GameObject.js";

export default class Circle extends GameObject {
  shape = "circ";

  constructor(id, { x, y, r }, texture, options) {
    super(id, texture, options);

    this.x = x;
    this.y = y;
    this.r = r;
  }

  get w() {
    return this.r * 2;
  }
  get h() {
    return this.r * 2;
  }

  collidingWithSquare(target) {
    console.log(this.x, this.y);
    console.log(target.x, target.y);
  }

  collidingWithCircle(target) {
    console.log(this.x, this.y);
    console.log(target.x, target.y);
  }
}
