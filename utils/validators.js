exports.validateEmail = (email) => {
  if (typeof email !== "string" || email.length > 150) return false;
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/;
  return re.test(email);
};

exports.validateLetters = (str) => {
  if (typeof str !== "string" || str.length > 200) return false;
  const pattern = /^[A-Za-z ąćęłńóśżźĄĆĘŁŃÓŚŻŹ-]+$/;
  return pattern.test(str);
};

exports.validateId = (str) => {
  if (typeof str !== "string" || str.length !== 24) return false;
  const pattern = /^[A-Za-z0-9]+$/;
  return pattern.test(str);
};

exports.validateJWT = (str) => {
  if (typeof str !== "string" || str.length > 200) return false;
  const pattern = /^[A-Za-z0-9]+$/;
  return pattern.test(str);
};

exports.validateUUID = (str) => {
  if (typeof str !== "string" || str.length !== 36) return false;
  const re =
    /[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{8}/;
  return re.test(str);
};

exports.validateNumbers = (str) => {
  if (!["number", "string"].includes(typeof str) || str.length > 150)
    return false;
  const pattern = /^[0-9 +-]+$/;
  return pattern.test(str);
};

exports.validateCharacters = (str) => {
  if (!["number", "string"].includes(typeof str) || str.length > 200)
    return false;
  const pattern = /^[A-Za-z0-9 .ąćęłńóśżźĄĆĘŁŃÓŚŻŹ-]*$/;
  return pattern.test(str);
};

exports.validateManyCharacters = (str) => {
  if (!["number", "string"].includes(typeof str) || str.length > 300)
    return false;
  const pattern = /^[A-Za-z0-9 ._/!%&#@ąćęłńóśżźĄĆĘŁŃÓŚŻŹ-]*$/;
  return pattern.test(str);
};

exports.validateIp = (str) => {
  if (typeof str !== "string" || str.length > 125) return false;
  const pattern = /^[0-9 fF.:]*$/;
  return pattern.test(str);
};
