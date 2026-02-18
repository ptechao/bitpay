// 前言：此檔案定義了 JWT (JSON Web Token) 認證中間件。
// 該中間件用於驗證傳入請求的 JWT，並將解碼後的用戶資訊附加到請求物件上，
// 以便後續的路由處理器可以存取用戶身份資訊。

const jwt = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {
  // 從請求頭中獲取 Token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "未提供認證 Token 或格式不正確" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 驗證 Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 將解碼後的用戶資訊附加到請求物件上
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "認證 Token 已過期" });
    }
    return res.status(401).json({ message: "無效的認證 Token" });
  }
};

module.exports = jwtAuth;
