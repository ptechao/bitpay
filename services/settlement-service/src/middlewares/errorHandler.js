// 檔案：src/middlewares/errorHandler.js
// 說明：集中處理應用程式中的錯誤，提供統一的錯誤回應格式。

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // 在控制台輸出錯誤堆棧，便於調試

  const statusCode = err.statusCode || 500;
  const message = err.message || "伺服器內部錯誤";

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};

module.exports = errorHandler;
