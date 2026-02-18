# 支付通道 Adapter 開發說明

## 前言
本目錄包含所有支付通道的 Adapter 實作。採用 Adapter Pattern（適配器模式）將不同通道的 API 差異封裝在獨立的 Adapter 類別中，並對支付引擎提供統一的介面，實現通道接入的標準化與解耦。

## 目錄結構
- `BaseAdapter.js`: 基礎類別，定義所有 Adapter 必須實作的統一介面。
- `ExampleAdapter.js`: 範例 Adapter，展示如何實作一個具體的通道對接。
- `AdapterFactory.js`: 工廠類別，根據通道代碼自動載入並實例化對應的 Adapter。

## 開發新通道步驟
1. **建立新檔案**：在 `src/adapters/` 目錄下建立 `NewChannelAdapter.js`。
2. **繼承 BaseAdapter**：確保新類別繼承自 `BaseAdapter`。
3. **實作介面**：實作 `createOrder`, `queryOrder`, `refund`, `verifyCallback` 四個核心方法。
4. **註冊 Adapter**：在 `AdapterFactory.js` 的 `getAdapter` 方法中新增對應的 `case` 分支。

## 統一介面規範
所有 Adapter 方法應返回統一格式的物件，以便支付引擎處理：

### 1. `createOrder` 返回格式
```javascript
{
  success: true,
  payUrl: "https://...", // 支付連結
  qrCode: "https://...", // (選填) QR 碼連結
  channelOrderId: "CH_123", // 通道訂單號
  raw: { ... } // 原始回應資料
}
```

### 2. `queryOrder` 返回格式
```javascript
{
  success: true,
  status: "PAID", // 統一狀態：PAID, PENDING, FAILED, REFUNDED
  amount: "100.00",
  paidAt: "2024-02-19T10:00:00Z"
}
```

### 3. `verifyCallback` 返回格式
```javascript
{
  isValid: true, // 簽名驗證是否通過
  platformOrderId: "PAY_123", // 平台訂單號
  status: "PAID", // 統一狀態
  amount: "100.00"
}
```
