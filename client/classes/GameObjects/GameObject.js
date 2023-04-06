export default class GameObject {
  texture = {};

  constructor(id, texture) {
    this.id = id;
    this.texture.type = texture.type;
    if (this.texture.type === "color") {
      this.texture.value = texture.value;
    } else if (this.texture.type === "graphic") {
      this.texture.value = texture.value;
    } else {
      throw new Error(
        `Texture type "${texture.type}" is not supported. Supported types: color, graphic.`
      );
    }
  }
}
