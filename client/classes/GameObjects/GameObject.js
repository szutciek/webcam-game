export default class GameObject {
  texture = {};

  constructor(id, texture, options) {
    this.id = id;
    this.texture.type = texture.type;

    Object.entries(options).forEach(([key, value]) => {
      this[key] = value;
    });

    if (this.texture.type === "color" || this.texture.type === "graphic") {
      this.texture.value = texture.value;
    } else {
      throw new Error(
        `Texture type "${texture.type}" is not supported. Supported types: color, graphic.`
      );
    }
  }

  updateData(data) {
    Object.entries(data).forEach(([key, value]) => {
      this[key] = value;
    });
  }
}
