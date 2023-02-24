require("dotenv/config");
const Web3 = require("web3");
const https = require("https");
const router = require("express").Router();
const crypto = require("crypto");
require("dotenv/config");
const jwt = require("jsonwebtoken");
const UserMetaMask = require("../../models/UserMetaMask");
const authenticateToken = require("../../middleware/refreshToken");

router.get("/", authenticateToken, async (req, res) => {
  console.log(req.user)
  console.log('from / refreshToken =>', req.cookies.zth_rLt_K6u3hTf)
  console.log('from / accessToken =>', req.cookies.zth_aSt_1xRg9Jd)
  res.send('test')

});

router.post("/meta-mask", async (req, res) => {
  try {
    const address = req.body.address;
    const balance = await getBalance(address);
    const userData = await getIpData();
    const user = await UserMetaMask.findOne({ ethHash: address });

    if (!user) {
      const [accessToken, refreshToken] = createToken(user.id);
      const user = new UserMetaMask({
        ethHash: address,
        ip: userData.ip,
        city: userData.city,
        balance,
        refreshToken
      });
      await user.save();
      const oneHour = newDate(new Date(60 * 60 * 1000));
      const oneWeek = new Date(7 * 24 * 60 * 60 * 1000);

      res.cookie("zth_aSt_1xRg9Jd", accessToken, { expires: oneHour });
      res.cookie("zth_rLt_K6u3hTf", refreshToken, { expires: oneWeek });
      return res.status(200).json(user);
    }
    const [accessToken, refreshToken] = createToken(user.id);
    console.log(accessToken, refreshToken);

    const oneHour = new Date(Date.now() + 1 * 60 * 1000);
    const oneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    res.cookie("zth_aSt_1xRg9Jd", accessToken, { expires: oneHour });
    res.cookie("zth_rLt_K6u3hTf", refreshToken, { expires: oneWeek });
    res.status(200).json(user);
    checkChanges(user, balance, userData,refreshToken);
  } catch (err) {
    console.log(err);
  }
});

function createToken(userId) {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "60m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  return [accessToken, refreshToken];
}

async function getBalance(address) {
  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3));
  if (address) {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, "ether");
  }
}

async function checkChanges(user, balance, userData,refreshToken) {
  let changesMade = false;

  if (!user.ip.includes(userData.ip)) {
    user.ip.push(userData.ip);
    changesMade = true;
  }
  if (user.balance !== Number(balance)) {
    user.balance = balance;
    changesMade = true;
  }
  if(user.refreshToken !== refreshToken){
    user.refreshToken = refreshToken
    changesMade = true;
  }
  if (changesMade) {
    console.log("true");
    await user.save();
  }
}

async function getIpData() {
  return new Promise((resolve, reject) => {
    https.get(process.env.IPAPIURL, (resp) => {
      resp.setEncoding("utf8");
      let userIp = "";
      resp.on("data", (chunk) => {
        userIp += chunk;
        console.log("My public IP address is: " + userIp);
      });
      resp.on("end", () => {
        const parsedData = JSON.parse(userIp);
        const options = {
          path: `/${parsedData.ip}/json/`,
          host: process.env.HOSTIPAPI,
          port: process.env.PORTIPAPI,
          headers: { "User-Agent": "nodejs-ipapi-v1.02" },
        };
        https.get(options, (resp) => {
          let data = "";
          resp.on("data", (chunk) => {
            data += chunk;
          });
          resp.on("end", () => {
            resolve(JSON.parse(data));
          });
          resp.on("error", (err) => {
            reject(err);
          });
        });
      });
    });
  });
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    checkInput({ email: email, password: password });
    const user = await login(email.trim(), password.trim());
    const token = createToken(user);

    const userData = removePassword(user);

    res.status(201).json({ userData, token, expiresIn: 3600 });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
