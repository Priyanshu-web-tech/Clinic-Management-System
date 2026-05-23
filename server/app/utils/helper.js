exports.getPagination = (page, size) => {
  const limit = size ? size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

exports.getTimeDiffInMin = (timestamp) => {
  if (!timestamp) return Infinity;
  return Math.floor((Date.now() - timestamp) / (1000 * 60));
};
