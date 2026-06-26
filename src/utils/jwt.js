const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn, jwtRefreshExpiresIn } = require("../config/env");

function signToken(payload) {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiresIn
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtRefreshExpiresIn
  });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = {
  signRefreshToken,
  signToken,
  verifyToken
};
