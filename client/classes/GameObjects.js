export default class GameObjects {
  #elements = new Map();
  #players = new Map();

  updatePlayerInfo(id, data) {
    const player = this.#players.get(id) || {};
    // add more fields for inventory etc.
    player.x = data.x;
    player.y = data.y;
    player.w = data.w;
    player.h = data.h;
    this.#players.set(id, player);
  }

  updatePlayerCamera(key, b64) {
    const p = this.#players.get(key);
    if (!p) return;
    p.camera = b64;
    this.#players.set(key, p);
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
