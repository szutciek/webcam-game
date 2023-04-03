const GameObject = require("./GameObject.js");

class StaticObject extends GameObject {
  constructor(id, position, texture) {
    super(id, position, texture);
    this.static = true;
  }
}

module.exports = StaticObject;
