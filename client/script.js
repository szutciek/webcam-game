import ClientController from "/classes/ClientController.js";
import UIController from "/classes/UIController.js";
import { requestCameraPermission, startStream, stream } from "/camera.js";

let clientController;

const setup = async () => {
  try {
    const token = window.localStorage.getItem("token");
    if (!token) window.location = "/signin?message=Please log in to play";
    const user = JSON.parse(window.localStorage.getItem("user"));
    if (!user) window.location = "/signin?message=Please log in to play";

    UIController.showLoadingScreen(
      user.username,
      user?.profile,
      user?.panelColor
    );

    UIController.changeLoadStatus("Starting camera stream");
    await requestCameraPermission();
    await startStream();

    UIController.showCameraLoadingScreen(stream);

    UIController.changeLoadStatus("Connecting to server");
    clientController = new ClientController({
      token,
      username: user.username,
    });

    UIController.showUser(user.username, user.panelColor);

    // handle room selection with ui
    const search = new URLSearchParams(window.location.search);
    const room = search.get("room");
    const map = search.get("map");

    UIController.changeLoadStatus(`Joining room ${room || "default"}`);
    if (!clientController.changeRoom(room, map)) return;
    UIController.changeLoadStatus("Starting game");
    clientController.startGame();
    UIController.hideLoadingScreen();
  } catch (err) {
    console.log(err);
  }
};

setup();

export { clientController };
