
/**
 * @fileoverview 錯誤處理中間件
 * @description 集中處理應用程式中的錯誤，返回標準化的錯誤回應。
 */

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // 在開發環境中印出錯誤堆疊，方便除錯

  const statusCode = err.statusCode || 500;
  const message = err.message || "內部伺服器錯誤";

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    // 在開發環境中才返回詳細錯誤資訊
    ...(process.env.NODE_ENV === "development" && { error: err.message, stack: err.stack }),
  });
};

module.exports = errorHandler;
