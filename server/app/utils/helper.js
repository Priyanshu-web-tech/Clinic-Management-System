exports.buildTrendRange = (days) => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1), 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  return { start, end };
};

exports.getPagination = (page, size) => {
  const limit = size ? size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

exports.getTimeDiffInMin = (timestamp) => {
  if (!timestamp) return Infinity;
  return Math.floor((Date.now() - timestamp) / (1000 * 60));
};

exports.generatePassword = () => {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const special = "@$!%*?&#";
  const all = lower + upper + nums + special;

  let password =
    lower[Math.floor(Math.random() * lower.length)] +
    upper[Math.floor(Math.random() * upper.length)] +
    nums[Math.floor(Math.random() * nums.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split("").sort(() => Math.random() - 0.5).join("");
};
