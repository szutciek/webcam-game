import ClientController from "/classes/ClientController.js";
import UIController from "/classes/UIController.js";
import { requestCameraPermission, startStream, stream } from "/camera.js";

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
    const clientController = new ClientController({
      token,
      username: user.username,
    });

    UIController.showUser(user.username, user.panelColor);

    // handle room selection with ui
    let room = new URLSearchParams(window.location.search).get("room");

    UIController.changeLoadStatus(`Joining room ${room || "default"}`);
    if (!clientController.changeRoom(room || "default")) return;
    UIController.changeLoadStatus("Starting game");
    clientController.startGame();
    UIController.hideLoadingScreen();
  } catch (err) {
    console.log(err);
  }
};

setup();
