
/**
 * @file services/shared/middlewares/corsConfig.js
 * @description 聚合支付平台 CORS (跨來源資源共享) 配置中介軟體。
 *              允許來自特定來源的請求，並配置允許的方法、標頭和憑證。
 * @author Manus AI
 * @date 2026-02-19
 */

const cors = require("cors");

// 允許的來源列表，建議從環境變數中讀取
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(",") : [
  "http://localhost:3000", // 商戶門戶
  "http://localhost:3008", // 管理員門戶
  "http://localhost:3009", // 代理商門戶
  "https://bitpay.gocc.store", // 生產環境域名
];

const corsOptions = {
  origin: (origin, callback) => {
    // 允許沒有 origin 的請求 (例如來自 Postman 或同源請求)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("不允許的 CORS 來源"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // 允許發送 Cookie 和 HTTP 認證憑證
  optionsSuccessStatus: 204, // 對於 OPTIONS 請求返回 204
  allowedHeaders: "Content-Type,Authorization,X-Requested-With,Accept,Origin,Idempotency-Key,X-Signature,X-Timestamp",
};

module.exports = cors(corsOptions);
