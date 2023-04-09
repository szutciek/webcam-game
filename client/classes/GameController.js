import canvas from "/canvas.js";
import { takePicture } from "/camera.js";

export default class GameController {
  #ws = undefined;

  #x = 0;
  #y = 0;

  #vw = window.innerWidth;
  #vh = window.innerHeight;

  #interval = undefined;
  #iteration = 0;

  lastTimeStamp = 0.015;
  serverTimeOrigin = 0;
  currentTick = 0;

  constructor(player, ws, uuid, gameObjects, serverTimeOrigin) {
    if (!player) throw new Error("Can't create game - player undefined");
    this.player = player;
    this.#ws = ws;
    this.uuid = uuid;
    this.gameObjects = gameObjects;
    this.serverTimeOrigin = serverTimeOrigin;
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
      this.currentTick++;
      const now = performance.now();
      const secondsPassed = (now - this.lastTimeStamp) / 1000;
      const notRounded = this.serverTimeOrigin - performance.timeOrigin + now;
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

      if (this.#ws.readyState === WebSocket.OPEN) {
        if (this.#iteration % 3 === 0) {
          if (!this.player) return;
          this.player.camera = takePicture();
          this.syncCamera();
        }
        if (this.#iteration % 30 === 0) {
          this.ping();
        }
        this.syncMovement(milisecondsServerStart);
      }

      // ==========================================================================
      // RENDERING PROCESS ========================================================
      // ==========================================================================

      this.centerPlayer();
      const promises = players.map((player) => canvas.prepareCamera(player));
      const pT = this.translateInView(this.player);
      promises.push(canvas.prepareCamera(pT));
      const prepared = await Promise.all(promises);

      canvas.clear();
      items.forEach((i) => canvas.drawItem(i));
      prepared.forEach((i) => canvas.drawPlayer(i, i.image, i.pose));

      // ==========================================================================
      // DISPLAYING STATS =========================================================
      // ==========================================================================

      document.getElementById(
        "renderedPlayers"
      ).innerText = `${prepared.length} Players`;
      document.getElementById(
        "renderedItems"
      ).innerText = `${items.length} Objects, `;

      // ==========================================================================
      // FINISHING TOUCHES ========================================================
      // ==========================================================================

      this.#iteration++;
      if (this.#iteration === 120) this.#iteration === 0;
      this.lastTimeStamp = performance.now();
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

  setServerTimeOrigin(time) {
    this.serverTimeOrigin = time;
  }

  syncCamera() {
    this.send(
      JSON.stringify({
        type: "cam",
        camera: this.player?.camera,
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
    canvas.el.width = window.innerWidth;
    canvas.el.height = window.innerHeight;

    this.renderFrame();
  }

  addResizeListener() {
    window.addEventListener("resize", () => {
      this.windowResize();
    });
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
