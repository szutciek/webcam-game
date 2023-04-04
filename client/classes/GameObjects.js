export default class GameObjects {
  #elements = new Map();
  #players = new Map();
  #interactive = new Map();

  constructor() {
    this.#interactive.set(crypto.randomUUID(), {
      position: { x: -100, y: 400, w: 40, h: 40 },
      texture: { type: "color", value: "red" },
      mesh: { type: "circle" },
    });

    setInterval(() => {
      this.checkIfPlayersAlive();
    }, 5 * 1000);
  }

  updatePlayer(id, data) {
    const player = this.#players.get(id) || {};
    player.x = data.position[0];
    player.y = data.position[1];
    player.w = data.position[2];
    player.h = data.position[3];
    player.pose = data.pose;
    if (data.username) player.username = data.username;
    if (data.camera) player.camera = data.camera;
    player.lastUpdate = new Date().getTime();
    this.#players.set(id, player);
  }

  // updatePlayerPosition(id, data) {
  //   const player = this.#players.get(id) || {};
  //   // add more fields for inventory etc.
  //   player.x = data.x;
  //   player.y = data.y;
  //   player.w = data.w;
  //   player.h = data.h;
  //   player.lastMessage = Date.now();
  //   this.#players.set(id, player);

  //   for (const [id, player] of this.#players) {
  //     if (player.lastMessage < Date.now() - 5 * 1000) {
  //       console.log(`Player ${id} wasn't active in 5s and got removed`);
  //       this.#players.delete(id);
  //     }
  //   }
  // }
  // updatePlayerPose(id, data) {
  //   const player = this.#players.get(id) || {};
  //   player.pose = data;
  //   this.#players.set(id, player);
  // }
  // updatePlayerCamera(key, b64) {
  //   const p = this.#players.get(key);
  //   if (!p) return;
  //   p.camera = b64;
  //   this.#players.set(key, p);
  // }

  checkIfPlayersAlive() {
    const alive = new Map();
    const now = new Date().getTime();
    this.#players.forEach((value, key) => {
      if (value.lastUpdate - now - 5 > 0) {
        value.lastUpdate = now;
        alive.set(key, value);
      }
    });
    this.#players = alive;
  }

  setObjects(data) {
    data.forEach((i) => {
      this.#elements.set(i.id, i);
    });
  }

  set allObjects(elements) {
    elements.forEach(([id, e]) => {
      this.#elements.set(id, e);
    });
  }
  set allPlayers(players) {
    players.forEach(([id, e]) => {
      this.#players.set(id, e);
    });
  }

  get allObjects() {
    return this.#elements;
  }
  get allPlayers() {
    return this.#players;
  }
}
