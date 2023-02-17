module.exports = () => (req, res, next) => {
  const corsWhitelist = ["http://127.0.0.1:5173", "http://localhost:5173"];
  if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin),
      res.setHeader("Access-Control-Allow-Credentials", true),
      res.setHeader("Access-Control-Allow-Methods", "HEAD, OPTIONS, GET, POST, PUT, DELETE"),
      res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  }
  next();
};
