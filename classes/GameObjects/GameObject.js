module.exports = class GameObject {
  constructor(id, texture) {
    this.id = id;
    this.texture = texture;
  }

  updateTexture(texture) {
    if (texture.type) this.texture.type = texture.type;
    if (texture.value) this.texture.value = texture.value;
  }
};
