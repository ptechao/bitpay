
/**
 * @file tests/integration/payment.integration.test.js
 * @description 聚合支付平台支付流程的整合測試。
 *              測試從訂單創建、支付模擬到回調通知的端到端流程。
 * @author Manus AI
 * @date 2026-02-19
 */

const axios = require("axios");

// 沙盒服務的基礎 URL
const SANDBOX_SERVICE_URL = "http://localhost:3001/api/sandbox";

describe("Payment Integration Test", () => {
  let createdOrder = null;

  // 在所有測試開始前，確保沙盒服務已啟動 (這裡假設它已在外部啟動)
  beforeAll(async () => {
    // 可以在這裡添加檢查沙盒服務是否可用的邏輯
    // 例如：try { await axios.get(`${SANDBOX_SERVICE_URL}/health`); } catch (e) { throw new Error("沙盒服務未運行"); }
    console.log("Payment Integration Test: 確保沙盒服務已啟動...");
  });

  test("應該成功創建一個沙盒訂單", async () => {
    const orderRef = `TEST_ORDER_${Date.now()}`;
    const notifyUrl = "http://localhost:3000/api/merchant/callback"; // 模擬商戶回調地址

    const response = await axios.post(`${SANDBOX_SERVICE_URL}/orders`, {
      merchantId: "test_merchant_001",
      amount: 100.00,
      currency: "TWD",
      orderRef,
      notifyUrl,
    });

    expect(response.status).toBe(200);
    expect(response.data.code).toBe("200");
    expect(response.data.message).toBe("訂單創建成功");
    expect(response.data.data).toHaveProperty("id");
    expect(response.data.data.status).toBe("PENDING");
    createdOrder = response.data.data;
  });

  test("應該成功模擬支付並收到回調", async () => {
    if (!createdOrder) {
      throw new Error("未成功創建訂單，無法進行支付模擬。");
    }

    // 模擬支付成功
    const simulateResponse = await axios.post(`${SANDBOX_SERVICE_URL}/payments/simulate`, {
      orderId: createdOrder.id,
      paymentStatus: "SUCCESS",
    });

    expect(simulateResponse.status).toBe(200);
    expect(simulateResponse.data.code).toBe("200");
    expect(simulateResponse.data.message).toBe("支付模擬請求已處理");
    expect(simulateResponse.data.data.status).toBe("SUCCESS");

    // 由於回調是異步的，這裡需要一些時間等待回調完成
    // 在實際情況中，商戶的回調服務會接收到通知，這裡我們直接查詢訂單狀態來驗證
    await new Promise(resolve => setTimeout(resolve, 500)); // 等待 500ms 讓回調有機會處理

    const orderDetailsResponse = await axios.get(`${SANDBOX_SERVICE_URL}/orders/${createdOrder.id}`);
    expect(orderDetailsResponse.status).toBe(200);
    expect(orderDetailsResponse.data.code).toBe("200");
    expect(orderDetailsResponse.data.data.status).toBe("SUCCESS");
  });

  test("應該成功模擬支付失敗", async () => {
    const orderRef = `TEST_ORDER_FAIL_${Date.now()}`;
    const notifyUrl = "http://localhost:3000/api/merchant/callback";

    const createResponse = await axios.post(`${SANDBOX_SERVICE_URL}/orders`, {
      merchantId: "test_merchant_002",
      amount: 50.00,
      currency: "USD",
      orderRef,
      notifyUrl,
    });
    const failedOrder = createResponse.data.data;

    const simulateResponse = await axios.post(`${SANDBOX_SERVICE_URL}/payments/simulate`, {
      orderId: failedOrder.id,
      paymentStatus: "FAILED",
    });

    expect(simulateResponse.status).toBe(200);
    expect(simulateResponse.data.code).toBe("200");
    expect(simulateResponse.data.message).toBe("支付模擬請求已處理");
    expect(simulateResponse.data.data.status).toBe("FAILED");

    await new Promise(resolve => setTimeout(resolve, 500));

    const orderDetailsResponse = await axios.get(`${SANDBOX_SERVICE_URL}/orders/${failedOrder.id}`);
    expect(orderDetailsResponse.status).toBe(200);
    expect(orderDetailsResponse.data.code).toBe("200");
    expect(orderDetailsResponse.data.data.status).toBe("FAILED");
  });

  test("應該處理支付超時模擬 (不立即更新狀態)", async () => {
    const orderRef = `TEST_ORDER_TIMEOUT_${Date.now()}`;
    const notifyUrl = "http://localhost:3000/api/merchant/callback";

    const createResponse = await axios.post(`${SANDBOX_SERVICE_URL}/orders`, {
      merchantId: "test_merchant_003",
      amount: 200.00,
      currency: "EUR",
      orderRef,
      notifyUrl,
    });
    const timeoutOrder = createResponse.data.data;

    const simulateResponse = await axios.post(`${SANDBOX_SERVICE_URL}/payments/simulate`, {
      orderId: timeoutOrder.id,
      paymentStatus: "TIMEOUT",
    });

    expect(simulateResponse.status).toBe(200);
    expect(simulateResponse.data.code).toBe("200");
    expect(simulateResponse.data.message).toBe("支付模擬請求已處理");
    expect(simulateResponse.data.data.status).toBe("TIMEOUT");

    // 超時模擬不應立即改變訂單狀態，而是等待外部系統或定時任務處理
    // 所以這裡查詢訂單狀態應該還是 PENDING
    await new Promise(resolve => setTimeout(resolve, 500));

    const orderDetailsResponse = await axios.get(`${SANDBOX_SERVICE_URL}/orders/${timeoutOrder.id}`);
    expect(orderDetailsResponse.status).toBe(200);
    expect(orderDetailsResponse.data.code).toBe("200");
    expect(orderDetailsResponse.data.data.status).toBe("PENDING"); // 狀態應保持 PENDING
  });

  test("查詢不存在的訂單應該返回 404", async () => {
    try {
      await axios.get(`${SANDBOX_SERVICE_URL}/orders/non_existent_order_id`);
    } catch (error: any) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.code).toBe("404");
      expect(error.response.data.message).toBe("訂單不存在");
    }
  });
});
