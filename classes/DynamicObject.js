const GameObject = require("./GameObject.js");

class DynamicObject extends GameObject {
  constructor(id, position, texture) {
    super(id, position, texture);
    this.static = false;
  }
}

module.exports = DynamicObject;
