const GameObject = require("./GameObject.js");

module.exports = class Chunk {
  gameObjects = new Map();

  constructor(quadrant, x, y) {
    this.quadrant = quadrant;
    this.x = x;
    this.y = y;
  }

  checkIfInBounds(coordinates) {
    console.log(coordinates);
  }

  // 100x100
  createObject(id, coordinates) {
    if (this.checkIfInBounds(coordinates)) {
      this.gameObjects.set(id, new GameObject());
    }
    console.log(this.gameObjects);
  }
};
