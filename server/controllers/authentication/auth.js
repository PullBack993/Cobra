require("dotenv/config");
const Web3 = require("web3");
const https = require("https");
const router = require("express").Router();
const crypto = require("crypto");
const UserMetaMask = require("../../models/UserMetaMask");
const refreshCookie = require("../../middleware/refreshToken");

router.get("/",refreshCookie, async (req, res) => {
  const loginToken = req.cookies.auth_token
  if (loginToken) {
    console.log(isActive)
    return res.json({isLogin: isActive})
  }
  res.json({ isLogin: false });
});


router.post("/meta-mask", async (req, res) => {
  try {
    const address = req.body.address;
    const balance = await getBalance(address);
    const userData = await getIpData();
    const id = crypto.randomBytes(16).toString("hex");
    const time  = new Date().getTime();
    const expires = new Date(time + 80 * 60 * 1000);
    const expiresOneHour = new Date(time + 90 * 60 * 1000);

    const hash = crypto.createHash("sha256").update(address).digest("hex");
    const loginToken = `${id}|${hash}`;

    const user = await UserMetaMask.findOne({ ethHash: address });

    if (!user) {
      const createUser = new UserMetaMask({
        ethHash: address,
        ip: userData.ip,
        city: userData.city,
        balance,
        hashId: [id, expiresOneHour],
      });
      await createUser.save();
      res.cookie("auth_token", `${loginToken}`, { expires: 10 });
      return res.status(200).json(createUser);
    }
    res.cookie("auth_token", `${loginToken}`, { expires: 10 });
    res.status(200).json(user);
    checkChanges(user, balance, userData, id, expiresOneHour);
  } catch (err) {
    console.log(err);
  }
});

async function getBalance(address) {
  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3));
  if (address) {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, "ether");
  }
}

async function checkChanges(user, balance, userData, id, expires) {
  let changesMade = false;

  if (!user.ip.includes(userData.ip)) {
    user.ip.push(userData.ip);
    changesMade = true;
  }
  if (user.balance !== Number(balance)) {
    user.balance = balance;
    changesMade = true;
  }
   if (user.hashId !== id) {
     user.hashId = [id, expires];
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
