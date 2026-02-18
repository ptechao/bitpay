// src/middlewares/errorHandler.js
/**
 * @file 通道管理服務錯誤處理中介軟體
 * @description 集中處理應用程式中的錯誤，返回標準化的錯誤響應。
 * @author Manus AI
 */

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // 在控制台輸出錯誤堆棧，便於調試

  const statusCode = err.statusCode || 500;
  const message = err.message || '內部伺服器錯誤';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};

module.exports = { errorHandler };
