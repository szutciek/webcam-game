import Canvas from "./Canvas.js";
import { takePicture } from "../camera.js";
import { getRecordedAudio } from "../voice.js";

const testAudio = new Audio();

export default class GameController {
  #ws = undefined;

  #x = 0;
  #y = 0;

  #vw = window.innerWidth;
  #vh = window.innerHeight;

  #runGame = true;
  #iteration = 0;

  lastTimeStamp = 0.015;
  serverTimeOrigin = 0;
  currentTick = 0;

  audio = [];

  constructor(controller, ws) {
    if (!controller.player)
      throw new Error("Can't create game - player undefined");

    this.controller = controller;
    this.player = controller.player;
    this.#ws = ws;
    this.uuid = controller.uuid;
    this.gameObjects = controller.gameObjects;
    this.serverTimeOrigin = controller.serverTimeOrigin;
    this.canvas = new Canvas("canvas");
  }

  startGame() {
    this.windowResize();
    this.addResizeListener();
    console.log("STARTING TO RENDER GAME...");
    this.player.activateMovement();
    this.centerPlayer();

    requestAnimationFrame(() => {
      this.renderFrame();
    });
  }

  stopGame() {
    this.#runGame = false;
    this.player.deactivateMovement();
  }

  centerPlayer() {
    this.#x = this.player.x + this.player.w / 2 - this.#vw / 2;
    this.#y = this.player.y + this.player.h / 2 - this.#vh / 2;
  }

  async renderFrame() {
    try {
      const time = performance.now();
      if (this.#runGame === false) return;

      this.currentTick++;

      const now = performance.now();
      const secondsPassed = (now - this.lastTimeStamp) / 1000;
      const notRounded = performance.timeOrigin + now - this.serverTimeOrigin;
      const milisecondsServerStart = Math.round(notRounded * 1000) / 1000;

      // ==========================================================================
      // PREPARING ELEMENTS IN VIEWPORT ===========================================
      // ==========================================================================

      const items = this.returnItemsFrame(this.gameObjects.allObjects);
      const players = this.returnItemsFrame(this.gameObjects.allPlayers);

      // ==========================================================================
      // MOVEMENT =================================================================
      // ==========================================================================

      this.player.addVelocity();
      this.player.subtractVelocity();
      this.player.performMovement(secondsPassed);

      // ==========================================================================
      // COLLISIONS ===============================================================
      // ==========================================================================

      items.forEach((item) => {
        this.player.collisionDetectionSAT(item, false);
      });

      players.forEach((item) => {
        this.player.collisionDetectionSAT(item, true);
      });

      // ==========================================================================
      // SENDING POSITION TO SERVER (for validation) ==============================
      // ==========================================================================

      if (this.#ws.readyState === WebSocket.OPEN)
        this.handleSync(milisecondsServerStart);

      // ==========================================================================
      // PREDICTING CHANGES =======================================================
      // ==========================================================================

      this.handlePrediction(secondsPassed, milisecondsServerStart);

      // ==========================================================================
      // RENDERING PROCESS ========================================================
      // ==========================================================================

      this.centerPlayer();
      const promises = [];
      players.forEach((player) =>
        promises.push(this.canvas.prepareCamera(player))
      );
      items.forEach((item) => {
        if (item.texture.type === "graphic") {
          this.canvas.prepareGraphic(item);
        }
      });
      const pT = this.translateInView(this.player);
      promises.push(this.canvas.prepareCamera(pT));
      const preparedCameras = await Promise.all(promises);

      this.canvas.clear();
      items.forEach((i) => this.canvas.drawItem(i));
      preparedCameras.forEach((i) => this.canvas.drawPlayer(i));

      // ==========================================================================
      // GAME TICK ===============================================================
      // ==========================================================================

      this.controller.gameModeController.tick();

      // ==========================================================================
      // FINISHING TOUCHES ========================================================
      // ==========================================================================

      this.#iteration++;
      if (this.#iteration === 120) this.#iteration === 0;

      requestAnimationFrame(() => {
        this.renderFrame();
      });

      this.lastTimeStamp = performance.now();
      // console.log(performance.now() - time);
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

  translateCircleInView(item) {
    const change = { ...item };
    change.x = item.x - this.#x;
    change.y = item.y - this.#y;
    change.r = item.r;
    return change;
  }

  translateToCanvas([x, y]) {
    return [x - this.#x, y - this.#y];
  }

  returnItemsFrame = (items) => {
    if (items == undefined) return;
    // if (!(items instanceof Map)) return;

    const maxRight = this.#x + this.#vw;
    const maxBottom = this.#y + this.#vh;

    const list = [];
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
      return;
    });
    return list;
  };

  drawItem(item) {
    this.canvas.drawItem(item);
  }

  setServerTimeOrigin(time) {
    this.serverTimeOrigin = time;
  }

  handlePrediction(secondsPassed, milisecondsServerStart) {
    this.gameObjects.predictMovement(secondsPassed);
    this.controller.gameModeController.predictMovement(
      secondsPassed,
      milisecondsServerStart
    );
  }

  handleSync(milisecondsServerStart) {
    this.handleCameraSync();
    this.handlePing();
    this.handleMovementSync(milisecondsServerStart);
    // this.handleAudioSync();
  }

  handleCameraSync() {
    if (this.#iteration % 15 === 0) {
      if (!this.player) return;
      this.player.camera = takePicture();
      this.syncCamera();
    }
  }

  handleAudioSync() {
    if (this.#iteration % 15 === 0) {
      if (!this.player) return;
      const [blob, time] = getRecordedAudio();
      this.audio.push(blob);

      const audioURL = URL.createObjectURL(new Blob(this.audio));
      testAudio.src = audioURL;
      testAudio
        .play()
        .then(() => {
          testAudio.currentTime = time / 1000 - 0.5;
        })
        .catch((err) => console.log("Play error"));
      this.player.addAudioBlob(blob);
      this.syncAudio();
    }
  }

  handlePing() {
    if (this.#iteration % 100 === 0) this.ping();
  }

  handleMovementSync(milisecondsServerStart) {
    this.syncMovement(milisecondsServerStart);
  }

  syncCamera() {
    this.send(
      JSON.stringify({
        type: "cam",
        camera: this.player?.camera,
      })
    );
  }

  async syncAudio() {
    this.send(
      JSON.stringify({
        type: "aud",
        audio: await this.player?.latestAudio.text(),
        // the timestamp should probably also be sent but idk
      })
    );
  }

  syncMovement(timeStamp) {
    this.send(
      JSON.stringify({
        type: "mov",
        velocities: this.player.velocities,
        position: this.player.position,
        pose: this.player.pose,
        relativeTimeStamp: timeStamp,
        tick: this.currentTick,
      })
    );
  }

  send(payload) {
    if (this.#ws.readyState === WebSocket.OPEN) this.#ws.send(payload);
  }

  windowResize() {
    this.canvas.el.width = window.innerWidth;
    this.canvas.el.height = window.innerHeight;
    this.#vw = window.innerWidth;
    this.#vh = window.innerHeight;
  }

  addResizeListener() {
    window.addEventListener("resize", () => {
      this.windowResize();
    });
  }

  handleClick(e) {
    // console.log(`Canvas clicked at ${e.clientX}, ${e.clientY}`);
  }

  handleMouseMove(e) {
    // console.log(`Mouse moved at ${e.clientX}, ${e.clientY}`);
  }

  get secondsPassed() {
    return (performance.now() - this.lastTimeStamp) / 1000;
  }

  get milisecondsServerStart() {
    return (
      performance.now() +
      performance.timeOrigin -
      this.controller.serverTimeOrigin
    );
  }

  get dimensions() {
    return {
      x: this.#x,
      y: this.#y,
      w: this.#vw,
      h: this.#vh,
    };
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  ping() {
    this.#ws.send(
      JSON.stringify({
        type: "ping",
        time: performance.now(),
      })
    );
  }
}
