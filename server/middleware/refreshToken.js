const UserMetaMask = require("../models/UserMetaMask");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies.zth_aSt_1xRg9Jd;
  const refreshToken = req.cookies.zth_rLt_K6u3hTf;
  console.log(accessToken);
  console.log(refreshToken);

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
        const [newAccessToken, refreshToken] = generateToken(user);
        setCookie(res, newAccessToken, refreshToken);
        updateUser(user, refreshToken);
        req.user = user;
        next();
      });
    } else {
      // Access token is valid,generate new accessToken, attach user data to request object
      const accessToken = generateAccessToken(user);
      setAccessCookie(res, accessToken);
      req.user = user;
      next();
    }
  });
};

function generateAccessToken(user) {
  const newAccessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "60m",
  });

  return newAccessToken;
}

function generateToken(user) {
  const newAccessToken = generateAccessToken(user);
  const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return [newAccessToken, refreshToken];
}

async function updateUser(user, refreshToken) {
  const currentUser = await UserMetaMask.findOne({ _id: user.id });
  if (currentUser.refreshToken) {
    currentUser.refreshToken = refreshToken;
    await currentUser.save();
  }
}

function setAccessCookie(res, accessToken) {
  const oneHour = new Date(Date.now() + 61 * 60 * 1000);
  res.cookie("zth_aSt_1xRg9Jd", accessToken, { expires: oneHour });
}

function setCookie(res, accessToken, refreshToken) {
  setAccessCookie(res, accessToken);
  const oneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  res.cookie("zth_rLt_K6u3hTf", refreshToken, { expires: oneWeek });
}
module.exports = authenticateToken;
