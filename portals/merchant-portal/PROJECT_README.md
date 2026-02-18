# 聚合支付平台 - 商戶端前端應用

## 項目概述

本項目是聚合支付平台的商戶端前端應用，使用 React + TypeScript 開發，提供商戶進行支付管理、訂單查詢、退款處理、結算查詢等功能。

## 技術棧

- **框架**: React 19 + TypeScript
- **路由**: Wouter
- **UI 組件**: shadcn/ui + Ant Design (antd)
- **HTTP 客戶端**: Axios
- **多語言**: i18next + react-i18next
- **樣式**: Tailwind CSS 4
- **構建工具**: Vite

## 支援語言

- 繁體中文 (zh-TW)
- 簡體中文 (zh-CN)
- 英文 (en-US)
- 日文 (ja-JP)
- 韓文 (ko-KR)
- 泰文 (th-TH)
- 越南文 (vi-VN)

## 項目結構

```
client/
├── src/
│   ├── api/                    # API 模組
│   │   ├── client.ts          # Axios 客戶端配置
│   │   ├── auth.ts            # 認證 API
│   │   ├── orders.ts          # 訂單 API
│   │   ├── refunds.ts         # 退款 API
│   │   ├── settlements.ts     # 結算 API
│   │   ├── paymentConfig.ts   # 支付配置 API
│   │   ├── merchant.ts        # 商戶資訊 API
│   │   └── index.ts           # API 索引
│   ├── i18n/                  # 多語言配置
│   │   ├── config.ts          # i18next 配置
│   │   └── locales/           # 翻譯檔案
│   │       ├── zh-TW.json
│   │       ├── zh-CN.json
│   │       ├── en-US.json
│   │       ├── ja-JP.json
│   │       ├── ko-KR.json
│   │       ├── th-TH.json
│   │       └── vi-VN.json
│   ├── layouts/               # 佈局組件
│   │   └── MainLayout.tsx     # 主佈局
│   ├── pages/                 # 頁面組件
│   │   ├── Login.tsx          # 登入頁
│   │   ├── Dashboard.tsx      # 儀表板
│   │   ├── Orders.tsx         # 訂單管理
│   │   ├── Refunds.tsx        # 退款管理
│   │   ├── Settlements.tsx    # 結算查詢
│   │   └── NotFound.tsx       # 404 頁面
│   ├── components/            # 可重用組件
│   ├── contexts/              # React Context
│   ├── lib/                   # 工具函數
│   ├── App.tsx                # 主應用組件
│   ├── main.tsx               # 應用入口
│   └── index.css              # 全局樣式
├── public/                    # 靜態資源
├── index.html                 # HTML 模板
└── package.json               # 依賴配置

server/                        # 後端佔位符
shared/                        # 共享類型定義
```

## 功能頁面

### 1. 登入頁 (Login)
- 商戶使用者名稱和密碼登入
- 表單驗證
- 錯誤提示

### 2. 儀表板 (Dashboard)
- 今日交易筆數和金額統計
- 交易成功率
- 待結算金額
- 近期交易列表

### 3. 訂單管理 (Orders)
- 支付訂單列表
- 訂單搜尋和篩選
- 訂單狀態查詢
- 訂單詳情查看

### 4. 退款管理 (Refunds)
- 退款申請列表
- 退款狀態查詢
- 申請新退款
- 退款詳情查看

### 5. 結算查詢 (Settlements)
- 結算單列表
- 結算詳情查看
- 提現申請
- 提現記錄查詢

### 6. 支付配置 (Coming Soon)
- 支付通道配置
- 回調地址設定
- API Key 管理

### 7. 收銀台 (Coming Soon)
- API 收銀台文件
- QR 碼收銀台測試

### 8. 個人設定 (Coming Soon)
- 修改密碼
- 商戶資訊編輯
- 結算帳戶管理

## 快速開始

### 安裝依賴

```bash
pnpm install
```

### 開發模式

```bash
pnpm dev
```

應用將在 `http://localhost:3000` 啟動

### 構建生產版本

```bash
pnpm build
```

### 預覽生產版本

```bash
pnpm preview
```

## API 配置

### 環境變數

在 `.env` 或 `.env.local` 中設定以下變數：

```
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

### API 客戶端使用示例

```typescript
import { authApi, ordersApi, refundsApi } from '@/api';

// 登入
const response = await authApi.login({
  username: 'merchant_001',
  password: 'password123'
});

// 查詢訂單列表
const orders = await ordersApi.getOrders({
  page: 1,
  page_size: 20,
  status: 'completed'
});

// 申請退款
const refund = await refundsApi.createRefund({
  order_id: 'ORDER123',
  amount: 50.00,
  reason: 'Customer request'
});
```

## 多語言使用

### 在組件中使用翻譯

```typescript
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <button onClick={() => i18n.changeLanguage('en-US')}>
        Switch to English
      </button>
    </div>
  );
}
```

### 翻譯檔案結構

翻譯檔案位於 `src/i18n/locales/` 目錄，採用 JSON 格式：

```json
{
  "common": {
    "appName": "聚合支付平台 - 商戶端",
    "dashboard": "儀表板"
  },
  "login": {
    "title": "商戶登入",
    "usernameLabel": "使用者名稱"
  }
}
```

## 認證流程

### 登入流程

1. 用戶在登入頁輸入使用者名稱和密碼
2. 調用 `authApi.login()` 發送登入請求
3. 後端返回 JWT 令牌
4. 令牌保存到 `localStorage`
5. 重定向到儀表板

### 令牌管理

- 令牌自動添加到所有 API 請求的 `Authorization` 頭
- 當收到 401 響應時，自動清除令牌並重定向到登入頁
- 支持令牌刷新機制

## 錯誤處理

### API 錯誤處理

```typescript
try {
  const response = await ordersApi.getOrders();
  console.log(response.data);
} catch (error) {
  console.error('API 錯誤:', error.message);
  // 顯示錯誤提示給用戶
}
```

### 全局錯誤邊界

應用使用 `ErrorBoundary` 組件捕獲 React 組件錯誤，防止應用崩潰。

## 開發指南

### 添加新頁面

1. 在 `src/pages/` 目錄創建新組件
2. 在 `src/App.tsx` 中添加路由
3. 在 `src/layouts/MainLayout.tsx` 中添加菜單項

### 添加新 API

1. 在 `src/api/` 目錄創建新模組
2. 定義 API 函數和類型
3. 在 `src/api/index.ts` 中匯出

### 添加新翻譯

1. 在所有翻譯檔案中添加新的翻譯鍵
2. 在組件中使用 `t('key')` 訪問

## 常見問題

### 如何修改 API 基礎 URL？

編輯 `src/api/client.ts` 中的 `baseURL` 配置，或設定環境變數 `REACT_APP_API_BASE_URL`。

### 如何添加新語言？

1. 在 `src/i18n/locales/` 目錄創建新的翻譯檔案
2. 在 `src/i18n/config.ts` 中導入並配置
3. 在 `src/layouts/MainLayout.tsx` 中添加語言選項

### 如何自定義主題顏色？

編輯 `src/index.css` 中的 CSS 變數，或使用 Tailwind CSS 的主題配置。

## 部署

### 構建靜態文件

```bash
pnpm build
```

構建後的文件位於 `dist/` 目錄。

### 部署到服務器

將 `dist/` 目錄的內容上傳到 Web 服務器，配置服務器將所有路由重定向到 `index.html`。

## 許可證

MIT

## 支援

如有問題或建議，請聯繫開發團隊。
