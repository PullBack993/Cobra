require("dotenv/config");
const { Web3 } = require("web3");
const https = require("https");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const UserMetaMask = require("../../models/UserMetaMask");
const authenticateToken = require("../../middleware/refreshToken");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await UserMetaMask.findById(req.user.id);
    if(user){
      const responseUser = { imageUrl: user.imageUrl, isLoggedIn: true }; 
      res.status(200).json(responseUser);
    }else{
      res.status(401).json({message: 'Unauthorized'})
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/meta-mask", async (req, res) => {
  try {
    const address = req.body.address;
    let balance = await getBalance(address);
    const userData = await getIpData();
    const user = await UserMetaMask.findOne({ ethHash: {$eq: address }});
    //TODO check $eq ?

    if (!user) {
      const imageUrl = await generateRandomImage();

      const newUser = new UserMetaMask({
        ethHash: address,
        ip: userData.ip,
        city: userData.city,
        balance,
        imageUrl: imageUrl.small,
      });
      await newUser.save();
      const [accessToken, refreshToken] = createToken(newUser._id);
      checkChanges(newUser, balance, userData, refreshToken);
      setCookie(res, accessToken, refreshToken);
      return res.status(200).json(newUser);
    }

    const [accessToken, refreshToken] = createToken(user._id);
    setCookie(res, accessToken, refreshToken);
    res.status(200).json(user);
    checkChanges(user, balance, userData, refreshToken);
  } catch (error) {
    console.log(error);
    const errResponse = {
      code: error.response?.status || 500,
      message: error.response?.data?.message || "An error occurred.",
    };
    res.status(errResponse.code).json(errResponse);
  }
});

function generateRandomImage() {
  const apiUrl = process.env.API_UNSPLASH;
  const accessKey = process.env.UNSPLASH;

  const params = `?client_id=${accessKey}&query=random`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  return new Promise((resolve, reject) => {
    try {
      const req = https.request(apiUrl + params, options, (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          const response = JSON.parse(responseData);

          if (res.statusCode === 200) {
            const imageUrls = {
              small: response.urls.small,
              regular: response.urls.regular,
              full: response.urls.full,
            };
            resolve(imageUrls);
          } else {
            reject(new Error(response.errors[0]));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.end();
    } catch (error) {
      console.error(error);
    }
  });
}

function setCookie(res, accessToken, refreshToken) {
  const oneHour = new Date(Date.now() + 61 * 60 * 1000);
  const oneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  res.cookie("zth_aSt_1xRg9Jd", accessToken, { expires: oneHour,sameSite: 'strict' });
  res.cookie("zth_rLt_K6u3hTf", refreshToken, { expires: oneWeek,sameSite: 'strict'});
}

function createToken(userId) {
  const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "60m",
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return [accessToken, refreshToken];
}

async function getBalance(address) {
  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3));
  if (address) {
    const balance = await web3.eth.getBalance(address);
    return web3.utils?.fromWei(balance, "ether");
  }
}

async function checkChanges(user, balance, userData, refreshToken) {
  let changesMade = false;

  if (!user.ip.includes(userData.ip)) {
    user.ip.push(userData.ip);
    changesMade = true;
  }
  if (user.balance !== Number(balance)) {
    user.balance = balance;
    changesMade = true;
  }
  if (user.refreshToken !== refreshToken) {
    user.refreshToken = refreshToken;
    changesMade = true;
  }
  if (changesMade) {
    await user.save();
  }
}

async function getIpData() {
//   return new Promise((resolve, reject) => {
//     https.get(process.env.IPAPIURL, (resp) => {
//       resp.setEncoding("utf8");
//       let userIp = "";
//       resp.on("data", (chunk) => {
//         userIp += chunk;
//       });
//       resp.on("end", () => {
//         const parsedData = JSON.parse(userIp);
//         const options = {
//           path: `/${parsedData.ip}/json/`,
//           host: process.env.HOSTIPAPI,
//           port: process.env.PORTIPAPI,
//           headers: { "User-Agent": "nodejs-ipapi-v1.02" },
//         };
//         https.get(options, (resp) => {
//           let data = "";
//           resp.on("data", (chunk) => {
//             data += chunk;
//           });
//           resp.on("end", () => {
//             resolve(JSON.parse(data));
//           });
//           resp.on("error", (err) => {
//             reject(err);
//           });
//         });
//       });
//     });
//   });
return {ip: '123'}
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
