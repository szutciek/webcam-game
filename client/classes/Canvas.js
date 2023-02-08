import { drawFace, drawBody } from "/canvasMethods.js";

export default class Canvas {
  constructor(id) {
    this.el = document.getElementById(id);
    this.ctx = this.el.getContext("2d");
  }

  drawItem(item) {
    if (!item.x || !item.y || !item.w || !item.h) return;
    if (!this.el.getContext) throw new Error("Canvas broken");
    if (!item.texture) throw new Error("Texture not specified");
    // works only with colors for now
    this.ctx.fillStyle = item.texture.value;
    if (!item.shape) return this.ctx.fillRect(item.x, item.y, item.w, item.h);
    if (item.shape === "rect")
      return this.ctx.fillRect(item.x, item.y, item.w, item.h);
    // if (shape === "circ") {
    //   this.ctx.fillStyle = color;
    //   this.ctx.beginPath();
    //   this.ctx.arc(coords[0], coords[1], coords[2], 0, 2 * Math.PI);
    //   this.ctx.fill();
    //   return;
    // }
  }

  prepareCamera(player) {
    return new Promise((res) => {
      if (!player.camera) res(player);
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

  drawPlayer(player, camera, pose) {
    let { x, y, w, h } = player;

    // this.ctx.fillStyle = "#F2CCB7";
    // this.ctx.fillRect(x, y, w, h);

    if (pose.crouching === true) {
      y += 50;
      h = 150;
    }

    // this.ctx.fillStyle = "#ff9999";
    // this.ctx.fillRect(x, y, w, h);

    drawBody(this.ctx, x, y, w, h, pose);
    drawFace(this.ctx, x, y, w, h, camera);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.el.width, this.el.height);
  }

  resize(width = window.innerWidth, height = window.innerHeight) {
    this.el.width = width;
    this.el.height = height;
  }
}
