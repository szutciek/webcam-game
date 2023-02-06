const GameObject = require("./GameObject.js");

module.exports = class Chunk {
  gameObjects = new Map();

  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.maxX = x + 1600;
    this.maxY = y + 1600;

    this.lastUpdate = Date.now();
  }

  // the chunk consists of 16 blocks each 100px in both dimensions
  // this means that the width and height is equal to 1600px
  // the smallest coordinate allowed in the chunk is x * 1600
  // the largest coordinate allowed in the chunk is (x+1) * 1600

  checkIfInBounds(coordinates) {
    // checks if the object indeed matches this chunk
    // every object is 100px wide so we need to account for that by adding 100
    if (this.x <= coordinates.x && this.maxX >= coordinates.x + 100) {
      if (this.y <= coordinates.y && this.maxY >= coordinates.y + 100) {
        return true;
      }
    }
    return false;
  }

  findObjectId(id) {
    return this.gameObjects.get(id) || undefined;
  }

  findObject(x, y) {
    for (const [, value] of this.gameObjects) {
      if (value.x === x && value.y === y) {
        return value;
      }
    }
  }

  checkIfExists(coordinates) {
    if (this.findObject(coordinates.x, coordinates.y)) return true;
    return false;
  }

  checkIfMultiple(num) {
    if (typeof num !== "number") return false;
    if (num % 100) return false;
    return true;
  }

  // 100x100
  createObject(coordinates, texture = { type: "color", value: "white" }) {
    // if (!this.checkIfMultiple(coordinates.x)) return;
    // if (!this.checkIfMultiple(coordinates.y)) return;
    if (!coordinates.x) return;
    if (!coordinates.y) return;
    if (!coordinates.w) return;
    if (!coordinates.h) return;
    if (this.checkIfInBounds(coordinates) && !this.checkIfExists(coordinates)) {
      const id = crypto.randomUUID();
      this.gameObjects.set(id, new GameObject(id, coordinates, texture));
      this.lastUpdate = Date.now();
    }
  }
};
