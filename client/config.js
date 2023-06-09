let wsURL = "wss://webcamgame.kanapka.eu/wss";
if (window.location.hostname === "localhost") wsURL = "ws://localhost:5501";
export { wsURL };
