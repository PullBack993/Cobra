const crypto = require("crypto");
const UserMetaMask = require("../models/UserMetaMask");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies.zth_aSt_1xRg9Jd;
  const refreshToken = req.cookies.zth_rLt_K6u3hTf;
  console.log("access token", accessToken);
  console.log("refresh token", refreshToken);

  // Check if access token is valid
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // Access token expired or invalid, try to refresh using refresh token
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) {
          // Refresh token expired or invalid, user needs to log in again
          return res.sendStatus(401);
        }

        // Generate new access token
        const newAccessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "60m",
        });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, {
          expiresIn: "7d",
        });
        const oneHour = new Date(Date.now() + 60 * 60 * 1000);
        console.log(oneHour)
        const oneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        res.cookie("zth_rLt_K6u3hTf", refreshToken, { expires: oneWeek });
        res.cookie("zth_aSt_1xRg9Jd", newAccessToken, { expires: oneHour});
        req.user = user;
        next();
      });
    } else {
      // Access token is valid, attach user data to request object
      req.user = user;
      next();
    }
  });
};

module.exports = authenticateToken;
