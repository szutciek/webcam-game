export default class GameObjects {
  #elements = new Map();
  #players = new Map();

  updatePlayerPosition(id, data) {
    const player = this.#players.get(id) || {};
    // add more fields for inventory etc.
    player.x = data.x;
    player.y = data.y;
    player.w = data.w;
    player.h = data.h;
    player.lastMessage = Date.now();
    this.#players.set(id, player);

    for (const [id, player] of this.#players) {
      if (player.lastMessage < Date.now() - 5 * 1000) {
        console.log(`Player ${id} wasn't active in 5s and got removed`);
        this.#players.delete(id);
      }
    }
  }
  updatePlayerPose(id, data) {
    const player = this.#players.get(id) || {};
    player.pose = data;
    this.#players.set(id, player);
  }
  updatePlayerCamera(key, b64) {
    const p = this.#players.get(key);
    if (!p) return;
    p.camera = b64;
    this.#players.set(key, p);
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
