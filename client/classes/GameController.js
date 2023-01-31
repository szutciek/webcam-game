import canvas from "/canvas.js";
import { takePicture } from "/camera.js";

export default class GameController {
  #x = 0;
  #y = 0;

  #vw = window.innerWidth;
  #vh = window.innerHeight;

  #interval = undefined;
  #webcamInterval = undefined;

  constructor(player, syncPosition, syncCamera) {
    if (!player) throw new Error("Can't create game - player undefined");
    this.player = player;
    this.sendSyncPosition = syncPosition;
    this.sendSyncCamera = syncCamera;
  }

  startGame() {
    console.log("STARTING TO RENDER GAME...");
    this.player.activateMovement();
    this.centerPlayer();

    this.renderFrame();
    this.#interval = setInterval(() => {
      this.renderFrame();
    }, 1000 / 60);

    this.#webcamInterval = setInterval(async () => {
      const picture = takePicture();
      console.log(picture);
    }, 1000 / 15);
  }
  stopGame() {
    clearInterval(this.#interval);
    this.player.deactivateMovement();
  }

  centerPlayer() {
    this.#x = this.player.x + this.player.w / 2 - this.#vw / 2;
    this.#y = this.player.y + this.player.h / 2 - this.#vh / 2;
  }

  renderFrame() {
    this.player.calcMovement();
    this.syncPosition();
    // comment out to have stationary camera
    this.centerPlayer();

    const items = this.returnItemsFrame(gameObjects.allObjects);
    const players = this.returnItemsFrame(gameObjects.allPlayers);
    // const players = gameObjects.allPlayers;

    canvas.clear();
    items.forEach((i) => canvas.draw([i.x, i.y, i.w, i.h], i.fc));

    // players.forEach((i) => canvas.draw([i.x, i.y, i.w, i.h], i.fc));
    players.forEach((i) => canvas.drawImage([i.x, i.y, i.w, i.h], i.camera));

    const pT = this.translateInView(this.player);
    canvas.draw([pT.x, pT.y, pT.w, pT.h], "purple");
  }

  translateInView(item) {
    return {
      x: item.x - this.#x,
      y: item.y - this.#y,
      w: item.w,
      h: item.h,
      fc: item.fc,
      camera: item.camera,
    };
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
        i.y + i.h > this.#x
      ) {
        list.push(this.translateInView(i));
      }
    });
    return list;
  };

  syncPosition() {
    this.sendSyncPosition(
      this.player.x,
      this.player.y,
      this.player.w,
      this.player.h
    );
  }
  syncCamera(id, b64) {
    this.sendSyncCamera(id, b64);
  }

  windowResize() {
    canvas.el.width = window.innerWidth;
    canvas.el.height = window.innerHeight;

    this.renderFrame();
  }
}
