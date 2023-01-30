export default class GameObjects {
  #elements = new Map();
  #players = new Map();

  updatePlayer(key, value) {
    this.#players.set(key, value);
  }
  updatePlayerCamera(key, b64) {
    const p = this.#players.get(key);
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
