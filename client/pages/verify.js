let waiting = false;
const inputs = [...document.querySelectorAll(".fancyInput")];

const search = new URLSearchParams(document.location.search);
const message = search.get("message");
const initialEmail = search.get("email");
const initialCode = search.get("code");

const query = [];
const gameRoom = search.get("room");
if (gameRoom) query.push(`room=${gameRoom}`);
const gameMap = search.get("map");
if (gameMap) query.push(`map=${gameMap}`);

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
    button.innerHTML = "Verify email";
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

const verify = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (waiting) throw new Error("Still waiting for response");
      let valid = true;

      const code = inputs.find((i) => i.dataset.field === "code");
      const codeField = code.querySelector("input");
      const email = inputs.find((i) => i.dataset.field === "email");
      const emailField = email.querySelector("input");

      if (!valid) throw new Error("Validation request not valid");

      animateButton("loading");

      waiting = true;
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeField.value,
          email: emailField.value,
        }),
      });
      waiting = false;

      if (res.status === 429) {
        animateButton("default");
        return res(renderMessage(res.statusText));
      }

      const message = await res.json();

      inputs.forEach((i) => handleInputChange(i));

      animateButton("default");
      if ([400, 401, 404].includes(res.status)) {
        message.additional?.fields?.forEach((err) => {
          handleInputError(err.field, err.message);
        });
        renderMessage(message.message);
      }
      if (res.status === 200) {
        animateButton("success");
        saveUserData(message.user);
        setTimeout(() => {
          window.location = `/${query.length ? `?${query.join("&")}` : ""}`;
        }, 1 * 1000);
        resolve();
      }
    } catch (err) {
      reject(err.message);
    }
  });
};

document.addEventListener("click", (e) => {
  if (e.target.closest(".fancyInput")) {
    handleInputEnter(e.target.closest(".fancyInput"));
  }

  if (e.target.id === "submit") {
    verify();
  }
});

document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    verify();
  }
});

if (initialEmail) {
  const emailField = inputs.find((i) => i.dataset.field === "email");
  handleInputEnter(emailField);
  emailField.querySelector("input").value = initialEmail;
}
if (initialCode) {
  const codeField = inputs.find((i) => i.dataset.field === "code");
  handleInputEnter(codeField);
  codeField.querySelector("input").value = initialCode;
}
