const url = window.location.href;
const urlObj = new URL(url);
let accessToken = urlObj.searchParams.get("access_token");

const decodeJwt = (token) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
};

const decoded = decodeJwt(accessToken);

if (decoded.client_id !== "wcgame") {
  throw new Error("The token was not generated for this client");
}

const saveUserData = (t, u) => {
  if (!t || !u) return;
  window.localStorage.setItem("token", t);
  window.localStorage.setItem("user", JSON.stringify(u));
};

saveUserData(accessToken, decoded.user);

window.location = "/";
