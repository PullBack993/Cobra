module.exports = () => (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173"),
    res.setHeader("Access-Control-Allow-Credentials", true),
    res.setHeader("Access-Control-Allow-Methods", "HEAD, OPTIONS, GET, POST, PUT, DELETE"),
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
};
