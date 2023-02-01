export default class Canvas {
  constructor(id) {
    this.el = document.getElementById(id);
    this.ctx = this.el.getContext("2d");
  }

  draw(coords, color, shape = "rect") {
    if (!coords) return;
    if (!this.el.getContext) throw new Error("Canvas broken");
    if (color) this.ctx.fillStyle = color;
    if (shape === "rect") {
      this.ctx.fillRect(...coords);
    } else if (shape === "circ") {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(coords[0], coords[1], coords[2], 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  prepareCamera(player) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.addEventListener("load", () => {
        player.image = img;
        res(player);
      });
      img.src = player.camera;
    });
  }

  drawImage(coords, img) {
    if (coords.length !== 4) return;
    if (!img) return;

    this.ctx.drawImage(img, coords[0], coords[1], coords[2], coords[3]);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.el.width, this.el.height);
  }

  resize(width = window.innerWidth, height = window.innerHeight) {
    this.el.width = width;
    this.el.height = height;
  }
}
