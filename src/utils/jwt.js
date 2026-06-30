const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn, jwtRefreshExpiresIn } = require("../config/env");
const {decode} = require("jsonwebtoken");

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

function userToken(token) {
  return decode(token);
}

module.exports = {
  signRefreshToken,
  signToken,
  verifyToken,
  userToken
};
