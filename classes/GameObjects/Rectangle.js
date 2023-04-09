const GameObject = require("./GameObject.js");

module.exports = class Rectangle extends GameObject {
  shape = "rect";

  constructor(id, { x, y, w, h }, texture, options) {
    super(id, texture, options.dynamic);

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.colliding = options.colliding || false;
  }

  get objectInfo() {
    return {
      shape: "rect",
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      texture: this.texture,
      colliding: this.colliding,
      dynamic: this.dynamic,
    };
  }
};
