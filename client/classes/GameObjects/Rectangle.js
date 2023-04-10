import GameObject from "/classes/GameObjects/GameObject.js";

export default class Rectangle extends GameObject {
  shape = "rect";

  constructor(id, { x, y, w, h }, texture, options) {
    super(id, texture, options);

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
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
