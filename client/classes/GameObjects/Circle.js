import GameObject from "/classes/GameObjects/GameObject.js";

export default class Circle extends GameObject {
  shape = "circle";

  constructor(id, { x, y, r }, texture, options) {
    super(id, texture);

    this.x = x;
    this.y = y;
    this.r = r;

    this.dynamic = options.dynamic;
    this.colliding = options.colliding;
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
