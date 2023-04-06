const Rectangle = require("./GameObjects/Rectangle.js");
const Circle = require("./GameObjects/Circle.js");

module.exports = class Chunk {
  staticObjects = new Map();
  dynamicObjects = new Map();

  constructor(x, y) {
    this.x = x;
    this.y = y;

    // this.maxX = x + 1600;
    // this.maxY = y + 1600;

    this.lastUpdate = Date.now();
  }

  get maxX() {
    return this.x + 1600;
  }

  get maxY() {
    return this.y + 1600;
  }

  // the chunk consists of 16 blocks each 100px in both dimensions
  // this means that the width and height is equal to 1600px
  // the smallest coordinate allowed in the chunk is x * 1600
  // the largest coordinate allowed in the chunk is (x+1) * 1600

  checkIfInBounds(coordinates) {
    // checks if the object indeed matches this chunk
    // every object is 100px wide so we need to account for that by adding 100

    // num so that it is possible to place but also wont appear suddenly
    if (
      this.x <= coordinates.x &&
      this.maxX + 200 >= coordinates.x + coordinates.w
    ) {
      if (
        this.y <= coordinates.y &&
        this.maxY + 200 >= coordinates.y + coordinates.h
      ) {
        return true;
      }
    }
    console.log("Object out of bounds!");
    return false;
  }

  get gameObjects() {
    return new Map([...this.dynamicObjects, ...this.staticObjects]);
  }

  calculateDynamicObjectMovement() {
    console.log("Calculating movement of dynamic objects");
  }

  findObjectId(id) {
    return this.gameObjects.get(id);
  }

  findObject(x, y) {
    for (const [, value] of this.gameObjects) {
      if (value.x === x && value.y === y) {
        return value;
      }
    }
    return undefined;
  }

  findUpdateObject({ x, y }, texture) {
    const object = this.findObject(x, y);
    if (!object) return;
    object.updateTexture(texture);
    this.lastUpdate = Date.now();
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

  objectFromClass(id, coordinates, texture, options) {
    if (!options.shape) {
      throw new Error("Shape not defined");
    }

    switch (options.shape) {
      case "rect":
        return new Rectangle(id, coordinates, texture, options);
      case "circ":
        return new Circle(id, coordinates, texture, options);
    }

    throw new Error("Coundn't create game object");
  }

  // 100x100
  createObject(
    coordinates,
    texture = { type: "color", value: "white" },
    options = { colliding: true, dynamic: false, shape: "rect" }
  ) {
    // if (!this.checkIfMultiple(coordinates.x)) return;
    // if (!this.checkIfMultiple(coordinates.y)) return;
    if (coordinates.x === undefined) return;
    if (coordinates.y === undefined) return;
    if (!coordinates.w) return;
    if (!coordinates.h) return;
    // handle errors when too wide
    if (this.checkIfInBounds(coordinates) && !this.checkIfExists(coordinates)) {
      const id = crypto.randomUUID();
      if (options.dynamic === true) {
        this.dynamicObjects.set(
          id,
          this.objectFromClass(id, coordinates, texture, options)
        );
      } else {
        this.staticObjects.set(
          id,
          this.objectFromClass(id, coordinates, texture, options)
        );
      }

      this.lastUpdate = Date.now();
    }
  }
};
