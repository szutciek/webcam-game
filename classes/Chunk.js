const UserError = require("../utils/UserError.js");

const Rectangle = require("./GameObjects/Rectangle.js");
const Circle = require("./GameObjects/Circle.js");

module.exports = class Chunk {
  staticObjects = new Map();
  dynamicObjects = new Map();

  constructor(x, y, findChunk) {
    this.x = x;
    this.y = y;
    this.findChunk = findChunk;

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
    if (!coordinates) return false;

    if (coordinates.r) {
      coordinates.w = coordinates.r;
      coordinates.h = coordinates.r;
    }

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

    return false;
  }

  get gameObjects() {
    return new Map([...this.dynamicObjects, ...this.staticObjects]);
  }

  get staticObjects() {
    return [...this.staticObjects];
  }

  get allObjects() {
    const list = [];
    this.staticObjects.forEach((o) => {
      list.push(o.objectInfo);
    });
    this.dynamicObjects.forEach((o) => {
      list.push(o.objectInfo);
    });
    return list;
  }

  calculateDynamicObjectMovement() {
    console.log("Calculating movement of dynamic objects");
  }

  findObjectId(id) {
    return this.gameObjects.get(id);
  }

  removeObjectId(id) {
    return this.gameObjects.delete(id);
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
      throw new UserError("Error while loading map: Shape not defined.", 400);
    }

    switch (options.shape) {
      case "rect":
        return new Rectangle(id, coordinates, texture, options, this);
      case "circ":
        return new Circle(id, coordinates, texture, options, this);
    }

    throw new UserError(
      "Error while loading map: Coundn't create game object.",
      400
    );
  }

  createObject(
    coordinates,
    texture = { type: "color", value: "white" },
    options = { colliding: true, dynamic: false, shape: "rect" }
  ) {
    try {
      let object = undefined;

      const inBounds = this.checkIfInBounds(coordinates);
      if (!inBounds)
        throw new UserError(
          "Error while adding object: Out of chunk bounds.",
          400
        );

      // handle errors when too wide
      if (inBounds && !this.checkIfExists(coordinates)) {
        const id = crypto.randomUUID();
        if (options.dynamic === true) {
          object = this.objectFromClass(id, coordinates, texture, options);
          this.dynamicObjects.set(id, object);
        } else {
          object = this.objectFromClass(id, coordinates, texture, options);
          this.staticObjects.set(id, object);
        }

        this.lastUpdate = Date.now();

        return object;
      }
    } catch (err) {
      throw err;
    }
  }

  importObject(object) {
    // most likely dynamic
    this.dynamicObjects.set(object.id, object);
  }
};
