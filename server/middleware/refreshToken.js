const crypto = require("crypto");

async function refreshCookie(req, res, next) {
  // Get the cookie from the request headers
  const cookie = req.headers.cookie;

  // Check if the cookie is present and has a valid format
  if (cookie && /auth_token=([^;]+)/.test(cookie)) {
      const [_, cookieValue] = cookie.match(/myCookie=([^;]+)/);
      await isTokenActive(req.cookies.auth_token)
    const now = Date.now();

    // Check if the cookie has expired or is about to expire
    if (now > expires - 10 * 1000) {
      // Generate a new cookie value with a new hash and expiration time TODO function
      const newCookieValue = `${newHash}|${newExpires}`;

      // Set the new cookie on the response headers
      // Store the new hash and expiration time in db
    }
  }

  next();
}


async function isTokenActive(token) {
  const parts = token.split("|");
  const id = parts[0];
  const hash = parts[1];
  const user = await UserMetaMask.findOne({ 'hashId.0': id });
  if (user) {
    const ethHash = user.ethHash;
    return (
      user.hashId[1] > new Date() &&
      crypto.createHash("sha256").update(ethHash).digest("hex") === hash
    );
  }
  return false;
}
