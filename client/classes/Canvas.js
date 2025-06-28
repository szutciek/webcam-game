import { drawFace, drawBody, drawSusBody, drawTag } from "../canvasMethods.js";

const loadedTextures = new Map();

export default class Canvas {
  visionRadius = null;

  constructor(id) {
    this.el = document.getElementById(id);
    this.ctx = this.el.getContext("2d");

    this.addCustomFonts();
    this.createVisibilityMaskCanvas();
  }

  addCustomFonts() {
    const font = new FontFace(
      "Poppins",
      "url(https://assets.kanapka.eu/fonts/Poppins/Poppins-Bold.ttf)",
      {
        weight: 800,
      }
    );
    font.load();
    document.fonts.add(font);
  }

  createVisibilityMaskCanvas() {
    this.visibilityCanvas = document.createElement("canvas");
    this.visibilityCanvas.width = window.innerWidth;
    this.visibilityCanvas.height = window.innerHeight;
    this.visibilityCtx = this.visibilityCanvas.getContext("2d");
  }

  clearVisibilityMaskCanvas() {
    if (!this.visibilityCtx) return;
    this.visibilityCtx.clearRect(
      0,
      0,
      this.visibilityCanvas.width,
      this.visibilityCanvas.height
    );
  }

  updateVisibilityDistance(visionRadius) {
    if (visionRadius === this.visionRadius) return;
    this.visionRadius = visionRadius;
    this.visionGradient = this.visibilityCtx.createRadialGradient(
      window.innerWidth / 2,
      window.innerHeight / 2,
      visionRadius - 30,
      window.innerWidth / 2,
      window.innerHeight / 2,
      visionRadius
    );
    this.visionGradient.addColorStop(0, "rgba(0, 0, 0, 1)"); // Fully visible
    this.visionGradient.addColorStop(1, "rgba(0, 0, 0, 0)"); // Invisible
  }

  applyVisibilityMask(visionRadius) {
    this.updateVisibilityDistance(visionRadius);

    const cX = window.innerWidth / 2;
    const cY = window.innerHeight / 2;

    this.visibilityCtx.globalCompositeOperation = "destination-in";
    this.visibilityCtx.fillStyle = this.visionGradient;
    this.visibilityCtx.fillRect(
      cX - this.visionRadius,
      cY - this.visionRadius,
      this.visionRadius * 2,
      this.visionRadius * 2
    );
    this.visibilityCtx.globalCompositeOperation = "source-over";

    this.ctx.drawImage(
      this.visibilityCanvas,
      0,
      0,
      this.visibilityCanvas.width,
      this.visibilityCanvas.height
    );
  }

  drawItem(item) {
    if (!item.texture) throw new Error("Texture not specified");

    if (item.texture.type === "color") {
      this.ctx.fillStyle = item.texture.value;
      if (!item.shape) return this.ctx.fillRect(item.x, item.y, item.w, item.h);
      if (item.shape === "rect") {
        if (!item.x || !item.y || !item.w || !item.h) return;
        this.ctx.fillRect(item.x, item.y, item.w, item.h);
        return;
      }
      if (item.shape === "circ") {
        if (!item.x || !item.y || !item.r) return;
        this.ctx.fillStyle = item.texture.value;
        this.ctx.beginPath();
        this.ctx.arc(item.x + item.r, item.y + item.r, item.r, 0, 2 * Math.PI);
        this.ctx.fill();
        return;
      }
    }

    if (item.texture.type === "graphic") {
      if (item.shape === "rect") {
        this.drawImage([item.x, item.y, item.w, item.h], item.texture.image);
      }
      if (item.shape === "circ") {
        this.drawImage(
          [item.x, item.y, item.r * 2, item.r * 2],
          item.texture.image,
          item?.rotation
        );
      }
    }
  }

  prepareGraphic(item) {
    return new Promise((res) => {
      if (!item.texture) return;
      const texture = loadedTextures.get(item.texture.value);
      if (texture) {
        item.texture.image = texture;
        res(item);
      } else {
        const img = new Image();
        img.addEventListener("load", () => {
          loadedTextures.set(item.texture.value, img);
          item.texture.image = img;
          res(item);
        });
        img.src = item.texture.value;
      }
    });
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

  drawImage(coords, img, rotation = 0) {
    if (coords.length !== 4) return;
    if (!img) return;

    if (rotation !== 0) {
      this.ctx.save();
      var rad = (rotation * Math.PI) / 180;
      this.ctx.translate(coords[0] + coords[2] / 2, coords[1] + coords[3] / 2);
      this.ctx.rotate(rad % (2 * Math.PI));
      this.ctx.drawImage(
        img,
        (coords[2] / 2) * -1,
        (coords[3] / 2) * -1,
        coords[2],
        coords[3]
      );
      this.ctx.restore();
    } else {
      this.ctx.drawImage(img, coords[0], coords[1], coords[2], coords[3]);
    }
  }

  drawPlayer(player, ctx = this.ctx) {
    try {
      let { x, y, w, h } = player;

      if (player.pose.crouching === true) {
        y += 50;
        h = 150;
      }

      // debug hitbox
      // this.ctx.fillStyle = "#ff9999";
      // this.ctx.fillRect(x, y, w, h);

      if (player.camera != undefined) {
        drawFace(ctx, x, y, w, h, player.image);
      }

      drawBody(ctx, player);

      if (player.username !== "Anonymous") {
        drawTag(ctx, x, y, w, h, player.username);
      }
    } catch (err) {
      throw err;
    }
  }

  drawSusPlayer(player, data, ctx = this.ctx) {
    try {
      let { x, y, w, h } = player;

      if (player.camera != undefined) {
        drawFace(ctx, x, y, w, h, player.image);
      }

      drawSusBody(ctx, player, data);

      if (player.username !== "Anonymous") {
        drawTag(ctx, x, y, w, h, player.username);
      }
    } catch (err) {
      throw err;
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.el.width, this.el.height);
  }

  resize(width = window.innerWidth, height = window.innerHeight) {
    this.el.width = width;
    this.el.height = height;
    if (this.visibilityCanvas) {
      this.visibilityCanvas.width = width;
      this.visibilityCanvas.height = height;
    }
  }
}
