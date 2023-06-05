const GameObject = require("./GameObject.js");

module.exports = class Circle extends GameObject {
  shape = "circ";

  constructor(id, { x, y, r }, texture, options) {
    super(id, texture, options);

    this.x = x;
    this.y = y;
    this.r = r;
  }

  get objectInfo() {
    return {
      id: this.id,
      shape: "circ",
      x: this.x,
      y: this.y,
      r: this.r,
      texture: this.texture,
      colliding: this.colliding,
      dynamic: this.dynamic,
      class: this?.class,
    };
  }

  get w() {
    return this.r * 2;
  }
  get h() {
    return this.r * 2;
  }
};
