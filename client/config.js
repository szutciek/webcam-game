let wsURL = "wss://webcamgame.kanapka.eu/wss";
if (window.location.hostname === "localhost") wsURL = "ws://localhost:5501";
let baseUrl = "https://webcamgame.kanapka.eu";
if (window.location.hostname === "localhost") baseUrl = "http://localhost:5500";
export { wsURL, baseUrl };
