module.exports = class GameObject {
  currentChunk = undefined;

  constructor(id, texture, options) {
    this.id = id;
    this.texture = texture;

    Object.entries(options).forEach(([key, value]) => {
      this[key] = value;
    });
  }

  updateTexture(texture) {
    if (texture.type) this.texture.type = texture.type;
    if (texture.value) this.texture.value = texture.value;
    this.chunk.lastUpdate = Date.now();
  }

  updatePosition(coords) {
    try {
      this.x = coords.x;
      this.y = coords.y;
      if (coords.r) this.r = coords.r;
      if (coords.w) this.w = coords.w;
      if (coords.h) this.h = coords.h;

      if (!this.room) return;

      // check if still in the same chunk and if not, move to the correct one
      if (!this.currentChunk)
        this.currentChunk = this.room.getChunk(this.x, this.y);

      const inBounds = this.currentChunk.checkIfInBounds(coords);

      if (!inBounds) {
        this.currentChunk.removeObjectId(this.id);
        this.currentChunk = this.room.getChunk(this.x, this.y);
        this.currentChunk.importObject(this);
      }

      this.currentChunk.lastUpdate = Date.now();
    } catch (err) {
      throw err;
    }
  }

  updateVelocity(velocities) {
    this.vX = velocities.x;
    this.vY = velocities.y;
  }
};
