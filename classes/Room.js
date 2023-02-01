const UserError = require("../utils/UserError");
const clients = require("../state/clients");
const Player = require("./Player.js");
const { maxPlayersRoom } = require("../config");
const Chunk = require("./Chunk");

module.exports = class Room {
  #players = new Map();

  // 16x16
  chunks = {
    A: new Map(),
    B: new Map(),
    C: new Map(),
    D: new Map(),
  };

  constructor(code) {
    this.code = code;

    this.createStartChunks(2);
  }

  createStartChunks(num) {
    for (let x = 0; x <= num; x++) {
      for (let y = 0; y <= num; y++) {
        this.createChunk("A", x, y);
        this.createChunk("B", x, y);
        this.createChunk("C", x, y);
        this.createChunk("D", x, y);
      }
    }
  }

  checkIfChunkExists(quadrant, x, y) {
    for (const [key] of this.chunks[quadrant]) {
      if (key[0] === x && key[1] === y) return true;
    }
  }

  createChunk(quadrant, x, y) {
    if (!quadrant || x === undefined || y === undefined) return;
    if (this.checkIfChunkExists(quadrant, x, y)) return;
    this.chunks[quadrant].set([x, y], new Chunk(quadrant, x, y));
  }

  findChunkQuadrant(quadrant) {
    return this.chunks[quadrant];
  }

  findChunk(quadrant, x, y) {
    return this.chunks[quadrant];
  }

  findObjectsRow(quadrant, x) {
    const list = [];
    for (const [key, value] of this.chunks[quadrant]) {
      if (key[0] === x) list.push(value);
    }
    return list;
  }
  findObjectsColumn(quadrant, x) {
    const list = [];
    for (const [key, value] of this.chunks[quadrant]) {
      if (key[0] === x) list.push(value);
    }
    return list;
  }

  joinRoom(uuid) {
    if (this.#players.size > maxPlayersRoom)
      throw new UserError("Room is full.");

    this.#players.set(uuid, new Player(uuid, { x: 0, y: 0, w: 100, h: 200 }));
  }

  leaveRoom(uuid) {
    this.#players.delete(uuid);
  }

  updatePlayerPosition(uuid, data) {
    const player = this.#players.get(uuid);
    player.updatePosition(data.data);
  }

  updatePlayerCamera(uuid, data) {
    const player = this.#players.get(uuid);
    player.camera = data;
    this.#players.set(uuid, player);
  }

  inside(uuid) {
    return this.#players.has(uuid);
  }

  broadcast(message, uuid) {
    for (const [id, client] of clients.allClients()) {
      if (client.room === this.code) {
        if (id !== uuid) {
          client.sendTo(message);
        }
      }
    }
  }

  get size() {
    return this.#players.size;
  }
};
