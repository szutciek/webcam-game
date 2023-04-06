const GameObject = require("./GameObject.js");

module.exports = class Circle extends GameObject {
  shape = "circ";

  constructor(id, { x, y, r }, texture, options) {
    super(id, texture);

    this.x = x;
    this.y = y;
    this.r = r;

    this.dynamic = options.dynamic;
    this.colliding = options.colliding;
  }
};
