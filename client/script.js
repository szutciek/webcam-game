import ClientController from "/classes/ClientController.js";
import { requestCameraPermission, startStream } from "/camera.js";

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
    let room = new URLSearchParams(window.location.search).get("room");

    if (!clientController.changeRoom(room || "default")) return;
    clientController.startGame();
  } catch (err) {
    console.log(err);
  }
};

setup();
