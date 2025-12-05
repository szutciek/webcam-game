import {
  drawFace,
  drawBody,
  drawSusBody,
  drawSusCorpse,
  drawTag,
} from "../canvasMethods.js";

const loadedTextures = new Map();

export default class Canvas {
  visionRadius = null;

  constructor(id) {
    this.el = document.getElementById(id);
    this.ctx = this.el.getContext("2d");

    this.addCustomFonts();
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

      // Draw only if player colors similar?
      // if (player.username !== "Anonymous") {
      //   drawTag(ctx, x, y, w, h, player.username);
      // }
    } catch (err) {
      throw err;
    }
  }

  drawCorpse(corpse, data, ctx = this.ctx) {
    drawSusCorpse(ctx, corpse, data);
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
