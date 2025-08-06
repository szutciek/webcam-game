const response = await fetch("https://sso.kanapka.eu/.well-known/rsa.key.pub");
const publicKey = await response.text();

export const verifyToken = (token) => {
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  });
  console.log(decoded);
};
