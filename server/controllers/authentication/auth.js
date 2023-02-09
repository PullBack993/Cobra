require("dotenv/config");
const Web3 = require("web3");
const https = require("https");
const router = require("express").Router();
const UserMetaMask = require("../../models/UserMetaMask");

router.post('/', async (req, res) => {
  console.log(req.header.cookie);
  console.log(req.cookies);
  res.cookie('test','test', 3)
  res.json('yes')
})

router.post("/meta-mask", async (req, res) => {
  try {
    console.log(req.cookies.value);
    const address = req.body.address;
    const balance = await getBalance(address);
    const userData = await getIpData();
    console.log("balance", balance);
    const user = await UserMetaMask.findOne({ ethHash: address });

    if (!user) {
      const createUser = new UserMetaMask({
        ethHash: address,
        ip: userData.ip,
        city: userData.city,
        balance,
      });
      await createUser.save();
      console.log("createUser", createUser);
      return res.status(200).json(createUser);
    }

    res.status(200).json(user);
    checkChanges(user, balance, userData);
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

async function checkChanges(user, balance, userData) {
  let changesMade = false;

  if (!user.ip.includes(userData.ip)) {
    user.ip.push(userData.ip);
    changesMade = true;
  }
  if (user.balance !== Number(balance)) {
    user.balance = balance;
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
