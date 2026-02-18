
/**
 * @fileoverview 認證中間件
 * @description 驗證 JWT token，確保使用者已登入並有權限訪問受保護的路由。
 */

const JwtUtil = require("../utils/jwt.util");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "未提供認證 token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = JwtUtil.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "無效的 token" });
    }
    req.user = decoded; // 將解碼後的使用者資訊附加到請求物件上
    next();
  } catch (error) {
    return res.status(401).json({ message: "無效的 token", error: error.message });
  }
};

module.exports = authMiddleware;
