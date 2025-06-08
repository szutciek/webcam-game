import GameObject from "./GameObject.js";

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

  collidingWithRectangle(rectangle) {
    const intXLeft = Math.abs(this.x + this.r - rectangle.x) < this.r;
    const intXRight =
      Math.abs(rectangle.x + rectangle.w - this.x - this.r) < this.r;
    const intXMiddle =
      rectangle.x < this.x && rectangle.x + rectangle.w > this.x + this.r;

    const intYTop = Math.abs(this.y + this.r - rectangle.y) < this.r;
    const intYBottom =
      Math.abs(rectangle.y + rectangle.h - this.y - this.r) < this.r;
    const intYMiddle =
      rectangle.y < this.y && rectangle.y + rectangle.h > this.y + this.r;

    return (
      (intXLeft || intXMiddle || intXRight) &&
      (intYTop || intYMiddle || intYBottom)
    );
  }

  collidingWithCircle(circle) {
    const dx = circle.x - this.x;
    const dy = circle.y - this.y;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = circle.r + this.r;
    return distanceSquared <= radiusSum * radiusSum;
  }
}
