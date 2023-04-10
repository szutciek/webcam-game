exports.choose = (obj, fields = []) => {
  const filtered = {};
  fields.forEach((f) => {
    if (obj[f]) {
      filtered[f] = obj[f];
    }
  });
  return filtered;
};
