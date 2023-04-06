export default class Player {
  constructor({ x, y, w, h }, info) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.username = info.username;
  }

  collidingWithSquare();
}
