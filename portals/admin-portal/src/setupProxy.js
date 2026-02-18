/**
 * @file setupProxy.js
 * @description 開發環境的 API 請求代理配置。
 * @author Manus AI
 * @date 2026-02-19
 */

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api", // 當請求路徑以 /api 開頭時，觸發代理
    createProxyMiddleware({
      target: "http://localhost:8080", // 後端 API 服務的地址
      changeOrigin: true,
      pathRewrite: {
        "^/api": "", // 重寫路徑，將 /api 替換為空字串
      },
    })
  );
};
