import "/classes/UIListener.js";
import Message from "/classes/UIMessage.js";
import GameUIController from "/classes/GameUIController.js";

class UIController {
  messages = [];
  timeShown = undefined;

  constructor() {
    this.screen = document.getElementById("loadingScreen");

    this.pingElement = document.getElementById("ping");
    this.userElement = document.getElementById("user");
    this.roomPlayersElement = document.getElementById("players");

    this.createUIController();
  }

  hideLoadingScreen = () => {
    const visible = new Date().getTime() - this.timeShown;
    // show for minimum 2.5 seconds to avoid flash
    setTimeout(() => {
      setTimeout(() => {
        this.screen.style.display = "none";
      }, 300);
      this.screen.style.opacity = 0;
      this.screen.style.pointerEvents = "none";
    }, 0 * 1000 - visible);
  };

  updateRoomInfo(info) {
    this.roomPlayersElement.innerText = `${info.players.length} online, room ${info.code}`;
  }

  showLoadingScreen(username, profile, color = "#ffffff") {
    const usernameField = this.screen.querySelector("h1");
    usernameField.innerText = username;
    const profileField = this.screen.querySelector("img");
    profileField.src = profile;
    this.screen.style.backgroundColor = color;
  }

  showCameraLoadingScreen = (stream) => {
    const camera = this.screen.querySelector("video");
    camera.srcObject = stream;
    camera.play();
    this.timeShown = new Date().getTime();
  };

  changeLoadStatus = (status) => {
    this.screen.querySelector("#loadStatusDisplay").innerText = status;
  };

  createMessage(content, icon, type) {
    return new Message(content, icon, type);
  }

  displayMessage(message) {
    this.messages.unshift(message);
    if (this.messages.length === 5) {
      const last = this.messages.pop();
      last.hide();
    }
    message.display();
  }

  showMessage(content, icon, type) {
    const message = this.createMessage(content, icon, type);
    this.displayMessage(message);
  }

  showUser(username, color) {
    this.userElement.innerText = username;
    this.userElement.closest(".box").style.backgroundColor = `${color}`;
  }

  showPing(ping) {
    const rounded = Math.round(ping * 10) / 10;
    this.pingElement.innerText = `${rounded} ms`;
    if (rounded > 50) {
      // this.pingElement.closest("div").style.border = "1px solid #ff000052";
      this.pingElement.closest("div").style.backgroundColor = "#ff000032";
    } else if (rounded > 30) {
      // this.pingElement.closest("div").style.border = "1px solid #ffbf0052";
      this.pingElement.closest("div").style.backgroundColor = "#ffbf0032";
    } else {
      // this.pingElement.closest("div").style.border = "1px solid #00ff2652";
      this.pingElement.closest("div").style.backgroundColor = "#00ff2622";
    }
  }

  setClientController(controller) {
    this.clientController = controller;
  }

  createUIController() {
    this.gameUIController = new GameUIController(this);
    this.gameUIController.addEventListeners();
  }

  handleGameClick(e) {
    this.clientController.handleGameClick(e);
  }
}

export default UIController;
