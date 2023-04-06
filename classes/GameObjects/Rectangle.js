const GameObject = require("./GameObject.js");

module.exports = class Rectangle extends GameObject {
  shape = "rect";

  constructor(id, { x, y, w, h }, texture, options) {
    super(id, texture);

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.dynamic = options.dynamic;
    this.colliding = options.colliding;
  }
};
