
/**
 * @file scripts/seed-test-data.js
 * @description 聚合支付平台測試數據生成腳本。
 *              生成模擬商戶數據，供壓力測試 (k6) 和整合測試使用。
 * @author Manus AI
 * @date 2026-02-19
 */

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const NUM_MERCHANTS = 100; // 生成 100 個商戶
const OUTPUT_DIR = path.join(__dirname, "test-data");
const MERCHANTS_FILE = path.join(OUTPUT_DIR, "merchants.json");

/**
 * 生成隨機商戶數據。
 * @param {number} count - 要生成的商戶數量。
 * @returns {Array<object>} 商戶數據陣列。
 */
const generateMerchants = (count) => {
  const merchants = [];
  for (let i = 0; i < count; i++) {
    merchants.push({
      id: uuidv4(),
      name: `Merchant ${i + 1}`,
      apiKey: uuidv4().replace(/-/g, ""), // 移除連字符
      apiSecret: uuidv4().replace(/-/g, ""),
      contactEmail: `merchant${i + 1}@example.com`,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    });
  }
  return merchants;
};

/**
 * 將數據寫入 JSON 檔案。
 * @param {string} filePath - 檔案路徑。
 * @param {object} data - 要寫入的數據。
 */
const writeToJsonFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log(`數據已寫入: ${filePath}`);
};

const seedTestData = () => {
  // 確保輸出目錄存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("開始生成測試數據...");

  // 生成商戶數據
  const merchants = generateMerchants(NUM_MERCHANTS);
  writeToJsonFile(MERCHANTS_FILE, { merchants });

  console.log("測試數據生成完成。");
};

seedTestData();
