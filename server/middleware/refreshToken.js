const crypto = require("crypto");
const UserMetaMask = require("../models/UserMetaMask");
const jwt = require("jsonwebtoken");

function generateTokens(user) {
  const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
  const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "60m",
  });

  return { refreshToken, accessToken };
}

function authenticateAccessToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}

function refreshAccessToken(req, res, next) {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    res.json({ accessToken: accessToken });
  });
}


async function isTokenActive(token) {
  const parts = token.split("|");
  const id = parts[0];
  const hash = parts[1];
  const user = await UserMetaMask.findOne({ "hashId.0": id }) 
    const ethHash = user.ethHash;

  if (user) {
      return (
        user.hashId[1] > new Date() &&
        crypto.createHash("sha256").update(ethHash).digest("hex") === hash
      );
    
  }
  return false;
}

module.exports = {  authenticateAccessToken, refreshAccessToken, generateTokens };
