import ClientController from "/classes/ClientController.js";
import UIControllerClass from "/classes/UIController.js";
import { requestCameraPermission, startStream, stream } from "/camera.js";

let clientController;

const redirectToSignin = (message, room, map) => {
  window.location = `/signin?message=${message}${room ? `&room=${room}` : ""}${
    map ? `&map=${map}` : ""
  }`;
};

const setup = async () => {
  try {
    // handle room selection with ui
    const search = new URLSearchParams(window.location.search);
    const room = search.get("room");
    const map = search.get("map");

    const token = window.localStorage.getItem("token", room, map);
    if (!token) {
      redirectToSignin("Please log in to play");
    }
    const user = JSON.parse(window.localStorage.getItem("user"));
    if (!user) {
      redirectToSignin("Please log in to play", room, map);
    }

    const UIController = new UIControllerClass();
    UIController.showLoadingScreen(
      user.username,
      user?.profile,
      user?.panelColor
    );

    UIController.changeLoadStatus("Starting camera stream");
    await requestCameraPermission();
    await startStream();

    UIController.showCameraLoadingScreen(stream);

    // TEMPORARY
    UIController.showCameraMenuScreen(stream);

    UIController.changeLoadStatus("Connecting to server");
    clientController = new ClientController(
      {
        token,
        username: user.username,
      },
      UIController
    );

    UIController.showUser(user.username, user.panelColor);

    UIController.changeLoadStatus(`Joining room ${room || "default"}`);
    if (!clientController.changeRoom(room, map)) return;

    UIController.changeLoadStatus("Starting game");
    await clientController.connectClient();
    clientController.joinRoom();

    UIController.hideLoadingScreen();
  } catch (err) {
    console.log(err);
  }
};

setup();

export { clientController };
