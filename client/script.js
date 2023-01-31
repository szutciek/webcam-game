// import GameController from "/classes/GameController.js";
// import currentSync from "/currentSync.js";
import ClientController from "/classes/ClientController.js";
import { requestCameraPermission, startStream } from "/camera.js";

// let player = new Player([0, 0]);

// can handle login before

// const gameController = new GameController(player);

// gameController.startGame();

const setup = async () => {
  try {
    await requestCameraPermission();
    await startStream();

    // handle user stuff with ui
    const clientController = new ClientController({
      token: crypto.randomUUID(),
      username: "Developer",
    });

    // handle room selection with ui
    let room = new URLSearchParams(window.location.search).get("r");

    if (!clientController.changeRoom(room)) return;
    clientController.startGame();
  } catch (err) {
    console.log(err);
  }
};

setup();

// gameController.windowResize();
// window.addEventListener("resize", () => {
//   gameController.windowResize();
// });
