const allClients = require();

module.exports = class GameState {
  players = new Map();

  playerWidth = 20;
  playerHeight = 100;

  constructor(id) {
    this.id = id;
  }

  addPlayer(id) {
    this.players.set(id, {
      x: 0,
      y: 0,
      w: this.playerHeight,
      h: this.playerWidth,
    });
  }
};
