// 檔案：src/middlewares/authMiddleware.js
// 說明：提供 JWT 認證和實體權限檢查的中介軟體。

const jwt = require("jsonwebtoken");
const { query } = require("../config/db");

// JWT 認證中介軟體
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // 無效的 token
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // 未提供 token
  }
};

// 實體權限檢查中介軟體
// 確保使用者只能查詢或操作自己的結算或提現記錄
const authorizeEntity = async (req, res, next) => {
  const { entityType, entityId } = req.params;
  const requestingUserId = req.user.userId; // 假設 JWT payload 中包含 userId
  const requestingUserType = req.user.userType; // 假設 JWT payload 中包含 userType (merchant, agent)

  try {
    let actualEntityId = null;

    if (requestingUserType === "merchant") {
      const merchantRes = await query("SELECT id FROM merchants WHERE user_id = $1", [requestingUserId]);
      if (merchantRes.rows.length > 0) {
        actualEntityId = merchantRes.rows[0].id;
      }
    } else if (requestingUserType === "agent") {
      const agentRes = await query("SELECT id FROM agents WHERE user_id = $1", [requestingUserId]);
      if (agentRes.rows.length > 0) {
        actualEntityId = agentRes.rows[0].id;
      }
    }

    // 檢查請求的 entityId 是否與實際的 entityId 匹配
    if (actualEntityId && parseInt(entityId) === actualEntityId) {
      return next();
    } else {
      return res.sendStatus(403); // 無權限
    }
  } catch (error) {
    console.error("授權檢查失敗:", error);
    res.sendStatus(500); // 伺服器錯誤
  }
};

module.exports = { authenticateJWT, authorizeEntity };
