const jwt = require("jsonwebtoken");

let publicKey = null;

const loadPublicKey = async () => {
  const response = await fetch(
    "https://sso.kanapka.eu/.well-known/rsa.key.pub"
  );
  publicKey = await response.text();
};
loadPublicKey();

exports.verifyToken = (token) => {
  if (!publicKey) throw new Error("Couldn't get public key");
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  });
  return decoded;
};

exports.isKanapkaSSOToken = (token) => {
  const decoded = jwt.decode(token, { complete: false });
  return decoded?.authority === "sso.kanapka.eu";
};
