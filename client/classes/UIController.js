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
    }, 2 * 1000 - visible);
  };

  showLoadingScreen = (username, profile) => {
    const usernameField = this.screen.querySelector("h1");
    usernameField.innerText = username;
    const profileField = this.screen.querySelector("img");
    profileField.src = profile;
  };

  showCameraLoadingScreen = (stream) => {
    const camera = this.screen.querySelector("video");
    camera.srcObject = stream;
    camera.play();
    this.timeShown = new Date().getTime();
  };
}

export default new UIController();
