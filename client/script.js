import GameController from "/classes/GameController.js";
import player from "/player.js";
import currentSync from "/currentSync.js";

const gameController = new GameController(player);

gameController.startGame();

gameController.windowResize();
window.addEventListener("resize", () => {
  gameController.windowResize();
});
