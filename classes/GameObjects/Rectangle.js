const GameObject = require("./GameObject.js");

module.exports = class Rectangle extends GameObject {
  shape = "rect";

  constructor(id, { x, y, w, h }, texture, options) {
    super(id, texture, options);

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  get objectInfo() {
    return {
      id: this.id,
      shape: "rect",
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      texture: this.texture,
      colliding: this.colliding,
      dynamic: this.dynamic,
      class: this?.class,
    };
  }
};
