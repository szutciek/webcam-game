import canvas from "/canvas.js";
import gameObjects from "/gameObjects.js";
import currentSync from "/currentSync.js";

export default class GameController {
  #x = 0;
  #y = 0;

  #vw = window.innerWidth;
  #vh = window.innerHeight;

  #interval = undefined;
  #webcamInterval = undefined;

  constructor(player, sync) {
    if (!player) throw new Error("Can't create game - player undefined");
    this.player = player;
    this.sync = sync;
  }

  startGame() {
    this.player.activateMovement();
    this.centerPlayer();

    this.renderFrame();
    this.#interval = setInterval(() => {
      this.renderFrame();
    }, 1000 / 60);

    this.#webcamInterval = setInterval(async () => {
      this.player.syncWebcam();
    }, 1000 / 5);

    console.log("Starting sync...");
    currentSync.startSync();
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
    this.player.syncMovement();
    // comment out to have stationary camera
    this.centerPlayer();

    const items = this.returnItemsFrame(gameObjects.allObjects);

    canvas.clear();
    items.forEach((i) => canvas.draw([i.x, i.y, i.w, i.h], i.fc));

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
    };
  }

  returnItemsFrame = (items) => {
    if (!(items instanceof Map)) return;

    const maxRight = this.#x + this.#vw;
    const maxBottom = this.#y + this.#vh;

    let list = [];
    items.forEach(
      (i) =>
        i.x < maxRight &&
        i.y < maxBottom &&
        i.x + i.w > this.#x &&
        i.y + i.h > this.#x &&
        list.push(this.translateInView(i))
    );
    return list;
  };

  syncPosition() {
    this.sync.syncPosition(x, y);
  }
  syncCamera(id, b64) {
    this.sync.syncCamera(id, b64);
  }

  windowResize() {
    canvas.el.width = window.innerWidth;
    canvas.el.height = window.innerHeight;

    this.renderFrame();
  }
}
