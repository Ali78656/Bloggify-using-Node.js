const JWT = require("jsonwebtoken");

const secret = "@li804#";

function createTokenForUser(user) {
  const payload = {
    id: user._id,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
    fullName: user.fullName,
  };
  const token = JWT.sign(payload, secret);
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }
    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload;
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Token validation failed:", error.message);
    }
    return next();
  };
}

module.exports = {
  createTokenForUser,
  validateToken,
  checkForAuthenticationCookie,
};
