// src/middlewares/authMiddleware.js
/**
 * @file JWT 認證中介軟體
 * @description 負責驗證請求中的 JWT Token，確保使用者已認證。
 * @author Manus AI
 */

const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

module.exports = { authenticateJWT };
