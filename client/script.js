import ClientController from "./classes/ClientController.js";
import UIControllerClass from "./classes/UIController.js";
import {
  requestCameraPermission,
  startVideoStream,
  videoStream,
} from "./camera.js";
import { requestMicPermission, startAudioStream } from "./voice.js";

let clientController;

const redirectToSignin = (message, room, map) => {
  window.location = `/signin?message=${message}${room ? `&room=${room}` : ""}${
    map ? `&map=${map}` : ""
  }`;
};

const setup = async () => {
  const UIController = new UIControllerClass();

  try {
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

    UIController.showLoadingScreen(
      user.username,
      user?.profile,
      user?.panelColor
    );

    UIController.changeLoadStatus("Starting media streams");
    await requestCameraPermission();
    // await requestMicPermission();
    await startVideoStream();
    // await startAudioStream();

    UIController.showCameraLoadingScreen(videoStream);
    UIController.showCameraMenuScreen(videoStream);

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
    UIController.changeLoadStatus(`${err}`, true);
    console.log(err);
  }
};

setup();

export { clientController };
