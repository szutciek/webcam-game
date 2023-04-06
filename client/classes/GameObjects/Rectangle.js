import GameObject from "/classes/GameObjects/GameObject.js";

export default class Rectangle extends GameObject {
  shape = "rect";

  constructor(id, { x, y, w, h }, texture, options) {
    super(id, texture);

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.dynamic = options.dynamic;
    this.colliding = options.colliding;

    console.log(this);
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
