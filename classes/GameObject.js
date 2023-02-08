module.exports = class GameObject {
  constructor(id, { x, y, w, h }, texture, ignore = false) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.texture = texture;
    this.ignore = ignore;
  }

  updateTexture(texture) {
    this.texture = texture;
  }
};

// extend this for special elements or stuff
