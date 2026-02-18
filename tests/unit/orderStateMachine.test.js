
/**
 * @file tests/unit/orderStateMachine.test.js
 * @description 聚合支付平台訂單狀態機的單元測試。
 *              測試訂單狀態的有效轉換和無效轉換。
 * @author Manus AI
 * @date 2026-02-19
 */

// 模擬一個簡單的訂單狀態機
const orderStateMachine = {
  states: {
    PENDING: ["PROCESSING", "FAILED"],
    PROCESSING: ["COMPLETED", "FAILED", "REFUNDED"],
    COMPLETED: ["REFUNDED"],
    FAILED: [],
    REFUNDED: [],
  },

  /**
   * 檢查狀態轉換是否有效。
   * @param {string} currentState - 當前狀態。
   * @param {string} nextState - 目標狀態。
   * @returns {boolean} 如果轉換有效則返回 true，否則返回 false。
   */
  canTransition: (currentState, nextState) => {
    return orderStateMachine.states[currentState] && orderStateMachine.states[currentState].includes(nextState);
  },

  /**
   * 嘗試將訂單狀態從當前狀態轉換到目標狀態。
   * @param {object} order - 訂單物件。
   * @param {string} nextState - 目標狀態。
   * @returns {object} 轉換後的訂單物件。
   * @throws {Error} 如果狀態轉換無效。
   */
  transitionState: (order, nextState) => {
    if (!order || !order.status) {
      throw new Error("無效的訂單物件或缺少狀態。");
    }
    if (orderStateMachine.canTransition(order.status, nextState)) {
      return { ...order, status: nextState };
    }
    throw new Error(`無效的狀態轉換: 從 ${order.status} 到 ${nextState}`);
  },
};

describe("Order State Machine", () => {
  let order;

  beforeEach(() => {
    order = {
      id: "order123",
      status: "PENDING",
      amount: 100,
      currency: "TWD",
    };
  });

  test("應該允許從 PENDING 轉換到 PROCESSING", () => {
    const newOrder = orderStateMachine.transitionState(order, "PROCESSING");
    expect(newOrder.status).toBe("PROCESSING");
  });

  test("應該允許從 PENDING 轉換到 FAILED", () => {
    const newOrder = orderStateMachine.transitionState(order, "FAILED");
    expect(newOrder.status).toBe("FAILED");
  });

  test("應該允許從 PROCESSING 轉換到 COMPLETED", () => {
    order.status = "PROCESSING";
    const newOrder = orderStateMachine.transitionState(order, "COMPLETED");
    expect(newOrder.status).toBe("COMPLETED");
  });

  test("應該允許從 COMPLETED 轉換到 REFUNDED", () => {
    order.status = "COMPLETED";
    const newOrder = orderStateMachine.transitionState(order, "REFUNDED");
    expect(newOrder.status).toBe("REFUNDED");
  });

  test("不應該允許從 PENDING 轉換到 COMPLETED", () => {
    expect(() => orderStateMachine.transitionState(order, "COMPLETED")).toThrow(
      "無效的狀態轉換: 從 PENDING 到 COMPLETED"
    );
  });

  test("不應該允許從 FAILED 轉換到 PROCESSING", () => {
    order.status = "FAILED";
    expect(() => orderStateMachine.transitionState(order, "PROCESSING")).toThrow(
      "無效的狀態轉換: 從 FAILED 到 PROCESSING"
    );
  });

  test("不應該允許從 REFUNDED 轉換到任何狀態", () => {
    order.status = "REFUNDED";
    expect(() => orderStateMachine.transitionState(order, "COMPLETED")).toThrow(
      "無效的狀態轉換: 從 REFUNDED 到 COMPLETED"
    );
  });

  test("處理無效的訂單物件", () => {
    expect(() => orderStateMachine.transitionState(null, "PROCESSING")).toThrow(
      "無效的訂單物件或缺少狀態。"
    );
    expect(() => orderStateMachine.transitionState({}, "PROCESSING")).toThrow(
      "無效的訂單物件或缺少狀態。"
    );
  });
});
