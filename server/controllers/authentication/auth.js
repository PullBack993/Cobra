require("dotenv/config");
const Web3 = require("web3");
const https = require("https");
const router = require("express").Router();
const UserMetaMask = require("../../models/UserMetaMask");

router.post("/meta-mask", async (req, res) => {
  //remove console.log()
  try {
    const address = req.body.address;
    const balance = await getBalance(address);
    console.log('balance', balance);
    data = await getIpData();
    const user = await UserMetaMask.findOne({ ethHash: address });
    
    console.log("user", data.ip);
    // if (!user) {
    //   const createUser = new UserMetaMask({ ethHash: address, ip: data.ip, city: data.city });
    //   console.log("createUser", createUser);
    //   res.sendStatus(200).json(createUser);
    // }
  } catch (err) {
    res.sendStatus(404).json({ err });
    console.log(err);
  }
});
async function getBalance(address) {
  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3));
  if (address) {
    const balance = await web3.eth.getBalance(address);
    // console.log(`Balance of address ${address}:`, web3.utils.fromWei(balance, "ether"));
    return web3.utils.fromWei(balance, "ether");
  }
}

async function getIpData() {
  let data = "";

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
        resp.on("data", (chunk) => {
          data += chunk;
        });
        resp.on("end", () => {
          data = JSON.parse(data);
        });
        resp.on("error", (err) => {
          return err;
        });
      });
    });
  });
  return data;
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
