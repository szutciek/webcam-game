class UIController {
  screen = document.getElementById("loadingScreen");
  timeShown = undefined;

  constructor() {}

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

  showLoadingScreen = (username, profile, color = "#ffffff") => {
    const usernameField = this.screen.querySelector("h1");
    usernameField.innerText = username;
    const profileField = this.screen.querySelector("img");
    profileField.src = profile;
    this.screen.style.backgroundColor = color;
  };

  showCameraLoadingScreen = (stream) => {
    const camera = this.screen.querySelector("video");
    camera.srcObject = stream;
    camera.play();
    this.timeShown = new Date().getTime();
  };

  changeLoadStatus = (status) => {
    this.screen.querySelector("#loadStatusDisplay").innerText = status;
  };
}

export default new UIController();
