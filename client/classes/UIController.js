import "/classes/UIListener.js";
import Message from "/classes/UIMessage.js";

const animationOverlay = [
  {
    opacity: 0,
    display: "block",
    backdropFilter: "blur(0px)",
    webkitBackdropFilter: "blur(0px)",
  },
  {
    opacity: 1,
    display: "block",
    backdropFilter: "blur(5px)",
    webkitBackdropFilter: "blur(5px)",
  },
];

const animationLayer = [
  {
    transform: "translateY(-25px) scale(1.1)",
    opacity: 0,
    display: "block",
  },
  {
    transform: "translateY(0) scale(1)",
    opacity: 1,
    display: "block",
  },
];

class UIController {
  messages = [];
  timeShown = undefined;

  constructor() {
    this.screen = document.getElementById("loadingScreen");

    this.pingElement = document.getElementById("ping");
    this.userElement = document.getElementById("user");
    this.roomPlayersElement = document.getElementById("players");
    this.menuScreen = document.getElementById("menuScreen");

    this.addEventListeners();
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

  showCameraMenuScreen = (stream) => {
    const camera = this.menuScreen.querySelector("video");
    camera.srcObject = stream;
    camera.play();
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

  addEventListeners() {
    document.addEventListener("click", (e) => this.handleClick(e));
    document.addEventListener("mousemove", (e) => this.handleGameMouseMove(e));
  }

  removeEventListeners() {
    document.removeEventListener("click", (e) => this.handleClick(e));
    document.removeEventListener("mousemove", (e) =>
      this.handleGameMouseMove(e)
    );
  }

  handleClick(e) {
    if (e.target.closest(".gameIgnoreClick") === null) {
      return this.handleGameClick(e);
    }
    if (e.target.closest(".openMenu") !== null) {
      return this.openMenu();
    }
    if (e.target.closest(".closeMenu") !== null) {
      return this.closeMenu();
    }
    if (e.target.closest(".menuScreen") !== null) {
      return this.clientController.menuController.handleClick(e);
    }
  }

  openMenu() {
    this.menuScreen.querySelector(".username").innerText =
      this.clientController.user.username;
    this.menuScreen.querySelector(".email").innerText =
      this.clientController.user.email;
    this.clientController.menuController.getDisplayPublicRooms();

    this.hideGameUI();
    this.clientController.ignoreGameInput = true;
    this.menuScreen.style.opacity = 1;
    this.menuScreen.style.pointerEvents = "auto";

    this.menuScreen
      .querySelector(".overlay")
      .animate(animationOverlay, { duration: 200, fill: "forwards" });

    const animationLayers = this.menuScreen.querySelectorAll(".animationLayer");
    animationLayers.forEach((layer, i) => {
      layer.style.opacity = 0;
      layer.animate(animationLayer, {
        duration: 400,
        delay: i * 100,
        fill: "forwards",
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      });
    });
  }

  closeMenu() {
    this.showGameUI();
    this.clientController.ignoreGameInput = false;
    this.menuScreen.style.opacity = 0;
    this.menuScreen.style.pointerEvents = "none";

    this.menuScreen.querySelector(".overlay").animate(animationOverlay, {
      duration: 100,
      fill: "forwards",
      direction: "reverse",
    });

    const animationLayers = this.menuScreen.querySelectorAll(".animationLayer");
    animationLayers.forEach((layer) => {
      layer.animate(animationLayer, {
        duration: 0,
        fill: "forwards",
        direction: "reverse",
      });
    });
  }

  hideGameUI() {
    document.querySelectorAll(".gameUI").forEach((element) => {
      element.style.scale = 0.9;
      element.style.filter = "blur(10px)";
    });
  }

  showGameUI() {
    document.querySelectorAll(".gameUI").forEach((element) => {
      element.style.scale = 1;
      element.style.filter = "blur(0)";
    });
  }

  handleGameClick(e) {
    if (this.clientController === undefined) return;
    this.clientController.handleGameClick(e);
  }

  handleGameMouseMove(e) {
    if (this.clientController === undefined) return;
    this.clientController.handleGameMouseMove(e);
  }
}

export default UIController;
