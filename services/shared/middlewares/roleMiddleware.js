// 前言：此檔案定義了角色認證中間件。
// 該中間件用於檢查當前用戶是否具有執行特定操作所需的角色。
// 它通常在 JWT 認證中間件之後使用，以確保用戶已通過身份驗證。

const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    // 確保 req.user 存在，這表示 JWT 認證中間件已成功執行
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "無權訪問：用戶角色資訊缺失" });
    }

    const userRole = req.user.role;

    // 檢查用戶的角色是否在允許的角色列表中
    if (requiredRoles.includes(userRole)) {
      next(); // 角色匹配，繼續處理請求
    } else {
      res.status(403).json({ message: "無權訪問：您的角色不允許此操作" });
    }
  };
};

module.exports = roleMiddleware;
