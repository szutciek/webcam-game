// import UIMessages from "/classes/UIMessages.js";
import { clientController } from "/script.js";

const chatInput = document.getElementById("chatMessage");

chatInput.addEventListener("keydown", (e) => {
  e.stopImmediatePropagation();

  if (e.key === "Enter") {
    clientController.sendChat(chatInput.value);
    chatInput.value = "";
    chatInput.blur();
  }
});

document.addEventListener("keypress", (e) => {
  if (e.code === "KeyT" && chatInput !== document.activeElement) {
    e.preventDefault();
    chatInput.value = "";
    chatInput.focus();
  }
});
