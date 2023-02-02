require("dotenv/config");

router.post("/login/meta-mask", async (req, res) => {
  try {
     const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
    address = accounts[0];
    console.log(address)
  // axios
  //     .post('http://localhost:3030/balance', { name: address.value })
  //   .then((res) => {
  //     console.log(res.data);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

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
