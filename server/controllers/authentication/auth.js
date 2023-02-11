require("dotenv/config");
const Web3 = require("web3");
const https = require("https");
const router = require("express").Router();
const crypto = require("crypto");
const UserMetaMask = require("../../models/UserMetaMask");

router.get("/", async (req, res) => {
  // const date = new Date(Date.now() + 60 * 60 * 1000);
  // const one = new Date(new Date().getTime() + 61 * 60 * 1000);

  // res.cookie("test", "test", { expires: one });

  // Access the "test" cookie using the req.cookies object
  // const testCookie = req.cookies.test;
  // console.log(req.cookies);

  // if (testCookie) {
  //   // const cookieData = JSON.parse(testCookie);

  //   // Check if the cookie's expiration date is still in the future
  //   const expires = new Date(testCookie.expires);
  //   console.log(testCookie.expires);

  //   if (testCookie.expires != 'Cookie is expired') {
  //     console.log("Cookie is still active");
  //     // Do something with the cookie...
  //   } else {
  //     console.log(new Date(testCookie.expires));
  //     console.log("Cookie has expired");
  //     // Delete the cookie
  //     res.clearCookie("test");
  //   }
  // } else {
  //   console.log("Cookie does not exist");
  // }

  res.json("yes");
});

// function isTokenActive(token) {
//   const [hash, expiresStr] = token.split(":");
//   const expires = new Date(expiresStr);
//   return (
//     expires > new Date() &&
//     hash ===
//       crypto
//         .createHash("sha256")
//         .update(initialHash + expiresStr)
//         .digest("hex")
//   );
// }
function isTokenActive(token, ethHash) {
  const parts = token.split("|");
  const id = parts[0];
  const hash = parts[1];
  const storedExpires = { [id]: new Date(new Date().getTime() + 60) }; // replace with the actual stored expiration date associated with the ID
  return (
    storedExpires[id] > new Date() &&
    crypto.createHash("sha256").update(ethHash).digest("hex") === hash
  );
}

router.post("/meta-mask", async (req, res) => {
  try {
    console.log(req.cookies.value);
    const address = req.body.address;
    const balance = await getBalance(address);
    const userData = await getIpData();
    // Generate initial hash
    // const ethHash = "0x123abc..."; // replace with your ETH hash
    const initialHash = crypto.createHash("sha256").update(address).digest("hex");

    // Generate login token
    // const expires = new Date(); // replace with your desired expiration date
    const id = crypto.randomBytes(16).toString("hex");
    const expires = new Date(new Date().getTime() + 60);
    const data = address;
    const hash = crypto.createHash("sha256").update(address).digest("hex");
    const loginToken = `${id}|${hash}`;
    console.log(`Login token: ${loginToken}`);

    const storedExpires = { [id]: expires };
    console.log(storedExpires)

    const token = loginToken; // replace with your actual token
    const isActive = isTokenActive(token, address);
    console.log(isActive);
    // Check if login token is still active

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
