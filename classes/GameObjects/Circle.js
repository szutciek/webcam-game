const GameObject = require("./GameObject.js");

module.exports = class Circle extends GameObject {
  shape = "circ";

  constructor(id, { x, y, r }, texture, options) {
    super(id, texture, options.dynamic);

    this.x = x;
    this.y = y;
    this.r = r;

    this.colliding = options.colliding || false;
  }

  get objectInfo() {
    return {
      shape: "circ",
      x: this.x,
      y: this.y,
      r: this.r,
      texture: this.texture,
      colliding: this.colliding,
      dynamic: this.dynamic,
    };
  }

  get w() {
    return this.r;
  }
  get h() {
    return this.r;
  }
};
