import {
  requestCameraPermission,
  startVideoStream,
  videoStream,
} from "/camera.js";

requestCameraPermission()
  .then(() => {
    startVideoStream().then(() => {
      const cameraPreview = document.getElementById("cameraPreview");
      cameraPreview.srcObject = videoStream;
      cameraPreview.play();
    });
  })
  .catch(console.log);

let waiting = false;
let loggedIn = false;
const inputs = [...document.querySelectorAll(".fancyInput")];

const message = new URLSearchParams(document.location.search).get("message");
const newUrl = window.location.origin + window.location.pathname;
window.history.pushState({ path: newUrl }, "", newUrl);

const renderMessage = (message) => {
  if (!message) return;
  const messsageArea = document.getElementById("messages");
  const list = document.createElement("li");
  const paragraph = document.createElement("p");
  paragraph.innerText = message;
  const close = document.createElement("div");
  close.addEventListener("click", () => list.classList.add("hidden"));
  close.classList.add("close");
  close.innerHTML = "&#10005";
  list.insertAdjacentElement("beforeend", paragraph);
  list.insertAdjacentElement("beforeend", close);
  messsageArea.insertAdjacentElement("beforeend", list);
};

renderMessage(message);

const attachListeners = (i) => {
  const input = i.querySelector("input");

  input.addEventListener("focus", (e) => {
    handleInputEnter(e.target.closest(".fancyInput"));
  });

  input.addEventListener("blur", (e) => {
    handleInputLeave(e.target.closest(".fancyInput"));
  });

  input.addEventListener("input", (e) => {
    handleInputChange(e.target.closest(".fancyInput"));
  });
};

inputs.forEach((i) => {
  attachListeners(i);
});

const handleInputEnter = (i) => {
  const placeholder = i.querySelector("#placeholder");
  const input = i.querySelector("input");

  if (!i.dataset.error) {
    input.style.borderColor = "#97acdf";
    placeholder.style.color = "#97acdf";
  }

  placeholder.style.fontSize = "0.8rem";
  placeholder.style.top = "0";
  placeholder.style.width = "auto";
};

const handleInputLeave = (i) => {
  const placeholder = i.querySelector("#placeholder");
  const input = i.querySelector("input");

  if (!i.dataset.error) {
    placeholder.style.color = "#a4a4a4";
    input.style.borderColor = "#b9b9b9";
  }

  if (!i.querySelector("input").value) {
    placeholder.style.fontSize = "1rem";
    placeholder.style.top = "50%";
  }
};

const handleInputError = (field, message) => {
  const i = inputs.find((i) => {
    changePage(i.dataset.page);
    return i.dataset.field === field;
  });
  if (!i) return;
  i.dataset.error = 1;

  const placeholder = i.querySelector("#placeholder");
  const input = i.querySelector("input");
  placeholder.style.color = "#ef5f5f";
  input.style.borderColor = "#ef5f5f";
  input.style.borderRadius = "2px 2px 0 0";
  const errorArea = i.querySelector(".errorArea");
  errorArea.querySelector("h6").innerText = message;
  errorArea.classList.remove("hidden");
};

const handleInputChange = (i) => {
  const placeholder = i.querySelector("#placeholder");
  const input = i.querySelector("input");
  const errorArea = i.querySelector(".errorArea");

  if (i.dataset.field === "username") {
    document.getElementById("usernamePreview").innerText = input.value;
  }
  if (i.dataset.field === "email") {
    document.getElementById("emailPreview").innerText = input.value;
  }
  if (i.dataset.field === "panelColor") {
    document.getElementById(
      "colorPreview"
    ).style.backgroundColor = `${input.value}`;
  }

  if (input === document.activeElement) {
    input.style.borderColor = "#97acdf";
    placeholder.style.color = "#97acdf";
  } else {
    placeholder.style.color = "#a4a4a4";
    input.style.borderColor = "#b9b9b9";
  }
  input.style.borderRadius = "2px";
  errorArea.classList.add("hidden");
  errorArea.querySelector("h6").innerText = "";
  delete i.dataset?.error;
};

const animateButton = (state) => {
  const button = document.getElementById("submit");
  if (state === "default") {
    button.innerHTML = "Sign up";
    button.style.backgroundColor = "#97acdf";
    button.style.cursor = "pointer";
  }
  if (state === "loading") {
    button.innerHTML = '<div class="loader"></div>';
    button.style.backgroundColor = "#889dcd";
    button.style.cursor = "default";
  }
  if (state === "success") {
    button.innerHTML = "Success!";
    button.style.backgroundColor = "#55b94e";
    button.style.cursor = "not-allowed";
  }
};

const saveUserData = (user) => {
  if (!user) return;
  window.localStorage.setItem("token", user.token);
  window.localStorage.setItem("user", JSON.stringify(user));
};

const signup = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (waiting) throw new Error("Still waiting for response");
      if (loggedIn) throw new Error("Already logged in");
      let valid = true;

      const username = inputs.find((i) => i.dataset.field === "username");
      const panelColor = inputs.find((i) => i.dataset.field === "panelColor");
      const email = inputs.find((i) => i.dataset.field === "email");
      const password = inputs.find((i) => i.dataset.field === "password");
      const passwordRepeat = inputs.find(
        (i) => i.dataset.field === "passwordRepeat"
      );

      const usernameInput = username.querySelector("input");
      const panelColorInput = panelColor.querySelector("input");
      const emailInput = email.querySelector("input");
      const passwordInput = password.querySelector("input");
      const passwordRepeatInput = passwordRepeat.querySelector("input");

      if (!valid) throw new Error("Login request not valid");

      animateButton("loading");

      waiting = true;
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameInput.value,
          panelColor: panelColorInput.value,
          email: emailInput.value,
          password: passwordInput.value,
          passwordRepeat: passwordRepeatInput.value,
        }),
      });
      waiting = false;

      if (res.status === 429) {
        animateButton("default");
        return resolve(renderMessage(res.statusText));
      }

      const message = await res.json();

      inputs.forEach((i) => handleInputChange(i));

      animateButton("default");
      if ([400, 401, 404].includes(res.status)) {
        message.additional?.fields?.forEach((err) => {
          handleInputError(err.field, err.message);
        });
      }
      if (res.status === 200) {
        animateButton("success");
        if (message.enforceEmailVerification !== true) {
          saveUserData(message.user);
          loggedIn = true;
          setTimeout(() => {
            window.location = "/";
          }, 1 * 1000);
        } else {
          renderMessage(message.displayMessage);
          setTimeout(() => {
            window.location = `/signin?message=${message.displayMessage}`;
          }, 1 * 1000);
        }
        resolve();
      }
    } catch (err) {
      reject(err.message);
    }
  });
};

const changePage = (page) => {
  const sliding = document.getElementById("sliding");
  const bar = document.getElementById("indicator");
  const titles = [...document.querySelectorAll(".progress li")];

  titles.forEach((title) => {
    title.classList.remove("active");
    if (title.dataset.page === page) {
      title.classList.add("active");
    }
  });

  if (page === "customization") {
    sliding.style.transform = "translateX(0)";
    bar.style.transform = "translateX(0)";
  }
  if (page === "information") {
    sliding.style.transform = "translateX(-100%)";
    bar.style.transform = "translateX(100%)";
  }
  if (page === "authentication") {
    sliding.style.transform = "translateX(-200%)";
    bar.style.transform = "translateX(200%)";
  }
};

document.addEventListener("click", (e) => {
  if (e.target.closest(".fancyInput")) {
    handleInputEnter(e.target.closest(".fancyInput"));
  }

  if (e.target.classList.contains("pageChange")) {
    changePage(e.target.dataset.page);
  }

  if (e.target.id === "submit") {
    signup();
  }
});
