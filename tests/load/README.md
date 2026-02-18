
/**
 * @file tests/load/README.md
 * @description 聚合支付平台壓力測試說明文件。
 *              介紹如何配置和執行 k6 壓力測試腳本。
 * @author Manus AI
 * @date 2026-02-19
 */

# 壓力測試 (Load Tests)

此目錄包含使用 [k6](https://k6.io/) 進行聚合支付平台壓力測試的腳本。這些測試旨在模擬高併發場景，評估系統在不同負載下的性能、穩定性和可擴展性。

## 測試腳本

- `k6-payment.js`: 模擬用戶創建訂單和模擬支付的流程。這是核心交易流程的壓力測試。
- `k6-query.js`: 模擬用戶查詢訂單和商戶資訊的流程。測試讀取操作的性能。
- `k6-settlement.js`: 模擬結算服務的請求。測試後台批處理和計算服務的性能。

## 環境準備

1.  **安裝 k6**: 依照 [k6 官方文件](https://k6.io/docs/getting-started/installation/) 安裝 k6。

    ```bash
    # 例如，在 Ubuntu/Debian 上安裝
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E34A72
    echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update
    sudo apt-get install k6
    ```

2.  **啟動後端服務**: 確保你的聚合支付平台後端服務 (特別是沙盒服務、商戶服務、報告服務等) 正在運行，並且可以通過 `http://localhost:3001`、`http://localhost:3004`、`http://localhost:3006` 等地址訪問。

    如果你使用 Docker Compose，可以在專案根目錄執行：
    ```bash
    docker-compose up -d postgres redis sandbox-service payment-service merchant-service report-service
    ```

3.  **生成測試數據**: 運行 `scripts/seed-test-data.js` 腳本來生成測試所需的商戶數據。這些數據將被 k6 腳本使用。

    ```bash
    node scripts/seed-test-data.js
    ```
    這將在 `scripts/test-data/merchants.json` 生成一個包含模擬商戶的檔案。

## 執行壓力測試

在終端機中，導航到專案根目錄，然後執行以下命令來運行特定的壓力測試腳本：

```bash
# 執行支付流程壓力測試
k6 run tests/load/k6-payment.js

# 執行查詢流程壓力測試
k6 run tests/load/k6-query.js

# 執行結算流程壓力測試
k6 run tests/load/k6-settlement.js
```

你也可以同時運行多個腳本，或者調整 `options` 中的 `stages` 配置來模擬不同的負載模式。

## 測試結果分析

k6 會在測試結束後輸出詳細的報告，包括：

-   **HTTP 請求成功率**: `http_req_failed` (應接近 0%)
-   **請求持續時間**: `http_req_duration` (95% 請求應在閾值內)
-   **虛擬用戶數 (VUs)**
-   **請求數**
-   **數據傳輸量**

請根據這些指標評估系統的性能瓶頸，並進行相應的優化。

## 注意事項

-   在執行壓力測試時，請確保你的測試環境與生產環境盡可能相似，以獲得更準確的結果。
-   壓力測試可能會對你的系統資源造成較大負擔，請在非生產環境中進行。
-   `k6-payment.js` 和 `k6-settlement.js` 腳本中假設了後端服務的 API 端點。請根據實際的微服務架構調整這些 URL。
