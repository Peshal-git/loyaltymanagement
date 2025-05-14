const jwt = require("jsonwebtoken");

const generateAccessToken = async (user) => {
  const { _id, name } = user.user;
  const payload = { _id, name };

  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "2h",
  });
  return token;
};
const generateRefreshToken = async (user) => {
  const { _id, name } = user;
  const payload = {
    _id,
    name,
  };
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "4h",
  });
  return token;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
