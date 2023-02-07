import canvas from "/canvas.js";
import { takePicture } from "/camera.js";

export default class GameController {
  #ws = undefined;

  #x = 0;
  #y = 0;

  #vw = window.innerWidth;
  #vh = window.innerHeight;

  #interval = undefined;
  #webcamInterval = undefined;

  constructor(player, ws, uuid, gameObjects) {
    if (!player) throw new Error("Can't create game - player undefined");
    this.player = player;
    this.#ws = ws;
    this.uuid = uuid;
    this.gameObjects = gameObjects;
  }

  startGame() {
    this.windowResize();
    this.addResizeListener();
    console.log("STARTING TO RENDER GAME...");
    this.player.activateMovement();
    this.centerPlayer();

    this.renderFrame();
    this.#interval = setInterval(() => {
      this.renderFrame();
    }, 1000 / 60);

    this.#webcamInterval = setInterval(async () => {
      try {
        if (!this.player) return;
        this.player.camera = await takePicture();
        this.syncCamera(this.uuid, this?.player?.camera);
      } catch (err) {
        console.log(err);
      }
    }, 1000 / 24);
  }
  stopGame() {
    clearInterval(this.#interval);
    this.player.deactivateMovement();
  }

  centerPlayer() {
    this.#x = this.player.x + this.player.w / 2 - this.#vw / 2;
    this.#y = this.player.y + this.player.h / 2 - this.#vh / 2;
  }

  async renderFrame() {
    try {
      const s = performance.now();

      const items = this.returnItemsFrame(this.gameObjects.allObjects);
      const players = this.returnItemsFrame(this.gameObjects.allPlayers);

      this.player.calcMovement(items);
      if (this.#ws.readyState === WebSocket.OPEN) this.syncPosition();
      // comment out to have stationary camera
      this.centerPlayer();

      const promises = players.map((player) => canvas.prepareCamera(player));
      const pT = this.translateInView(this.player);
      promises.push(canvas.prepareCamera(pT));
      const prepared = await Promise.all(promises);

      canvas.clear();
      // change to support image textures
      items.forEach((i) => canvas.drawItem(i));
      // players.forEach((i) => canvas.draw([i.x, i.y, i.w, i.h], "#555555"));
      prepared.forEach((i) => canvas.drawPlayer([i.x, i.y, i.w, i.h], i.image));

      document.getElementById("renderTime").innerText = `${
        performance.now() - s
      }`;
      document.getElementById(
        "renderedPlayers"
      ).innerText = `${prepared.length} Players`;
      document.getElementById(
        "renderedItems"
      ).innerText = `${items.length} Objects, `;
    } catch (err) {
      console.warn(err);
    }
  }

  translateInView(item) {
    const change = { ...item };
    change.x = item.x - this.#x;
    change.y = item.y - this.#y;
    change.w = item.w;
    change.h = item.h;
    return change;
  }

  returnItemsFrame = (items) => {
    if (!(items instanceof Map)) return;

    const maxRight = this.#x + this.#vw;
    const maxBottom = this.#y + this.#vh;

    let list = [];
    items.forEach((i) => {
      if (
        i.x < maxRight &&
        i.y < maxBottom &&
        i.x + i.w > this.#x &&
        i.y + i.h > this.#y
      ) {
        i.xMap = i.x;
        i.yMap = i.y;
        list.push(this.translateInView(i));
      }
    });
    return list;
  };

  sendSyncPosition(x, y, w, h) {
    this.send(
      JSON.stringify({
        type: "inf",
        uuid: this.uuid,
        data: [x, y, w, h],
      })
    );
  }

  syncPosition() {
    this.sendSyncPosition(
      this.player.x,
      this.player.y,
      this.player.w,
      this.player.h
    );
  }

  syncCamera(id, b64) {
    this.send(
      JSON.stringify({
        type: "cam",
        uuid: id,
        data: b64,
      })
    );
  }

  send(payload) {
    if (this.#ws.readyState === WebSocket.OPEN) this.#ws.send(payload);
  }

  windowResize() {
    canvas.el.width = window.innerWidth;
    canvas.el.height = window.innerHeight;

    this.renderFrame();
  }

  addResizeListener() {
    window.addEventListener("resize", () => {
      this.windowResize();
    });
  }
}
