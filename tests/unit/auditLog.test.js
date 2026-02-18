
/**
 * @file tests/unit/auditLog.test.js
 * @description 聚合支付平台審計日誌的單元測試。
 *              測試日誌記錄、敏感資訊遮蔽和查詢功能。
 * @author Manus AI
 * @date 2026-02-19
 */

// 模擬一個簡單的審計日誌服務
const auditLog = {
  logs: [],
  sensitiveFields: ["password", "creditCardNumber", "cvv"],

  /**
   * 記錄一個審計事件。
   * @param {string} userId - 執行操作的用戶 ID。
   * @param {string} action - 執行的操作 (e.g., "LOGIN", "ORDER_CREATED", "USER_UPDATED")。
   * @param {object} details - 操作的詳細資訊，敏感資訊會被遮蔽。
   */
  record: (userId, action, details) => {
    const maskedDetails = auditLog.maskSensitiveData(details);
    const logEntry = {
      id: auditLog.logs.length + 1,
      timestamp: new Date().toISOString(),
      userId,
      action,
      details: maskedDetails,
    };
    auditLog.logs.push(logEntry);
  },

  /**
   * 遮蔽物件中的敏感資訊。
   * @param {object} data - 原始數據物件。
   * @returns {object} 遮蔽敏感資訊後的物件。
   */
  maskSensitiveData: (data) => {
    if (!data || typeof data !== "object") {
      return data;
    }
    const masked = { ...data };
    for (const field of auditLog.sensitiveFields) {
      if (masked[field]) {
        masked[field] = "********";
      }
    }
    return masked;
  },

  /**
   * 獲取所有審計日誌。
   * @returns {Array<object>} 審計日誌列表。
   */
  getAllLogs: () => {
    return [...auditLog.logs];
  },

  /**
   * 根據用戶 ID 查詢審計日誌。
   * @param {string} userId - 用戶 ID。
   * @returns {Array<object>} 該用戶的審計日誌列表。
   */
  getLogsByUserId: (userId) => {
    return auditLog.logs.filter(log => log.userId === userId);
  },

  /**
   * 清空所有審計日誌 (僅用於測試)。
   */
  clearLogs: () => {
    auditLog.logs = [];
  },
};

describe("Audit Log", () => {
  beforeEach(() => {
    auditLog.clearLogs(); // 每個測試前清空日誌
  });

  test("應該正確記錄審計事件", () => {
    auditLog.record("user123", "LOGIN", { ip: "192.168.1.1", status: "SUCCESS" });
    const logs = auditLog.getAllLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].userId).toBe("user123");
    expect(logs[0].action).toBe("LOGIN");
    expect(logs[0].details.ip).toBe("192.168.1.1");
  });

  test("應該遮蔽敏感資訊", () => {
    auditLog.record("user456", "USER_REGISTER", {
      username: "testuser",
      password: "mysecretpassword",
      email: "test@example.com",
      creditCardNumber: "1234-5678-9012-3456",
    });
    const logs = auditLog.getAllLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].details.password).toBe("********");
    expect(logs[0].details.creditCardNumber).toBe("********");
    expect(logs[0].details.username).toBe("testuser");
    expect(logs[0].details.email).toBe("test@example.com");
  });

  test("應該根據用戶 ID 查詢日誌", () => {
    auditLog.record("user1", "ACTION_A", {});
    auditLog.record("user2", "ACTION_B", {});
    auditLog.record("user1", "ACTION_C", {});

    const user1Logs = auditLog.getLogsByUserId("user1");
    expect(user1Logs.length).toBe(2);
    expect(user1Logs[0].userId).toBe("user1");
    expect(user1Logs[1].userId).toBe("user1");

    const user2Logs = auditLog.getLogsByUserId("user2");
    expect(user2Logs.length).toBe(1);
    expect(user2Logs[0].userId).toBe("user2");

    const user3Logs = auditLog.getLogsByUserId("user3");
    expect(user3Logs.length).toBe(0);
  });

  test("如果沒有敏感資訊則不應遮蔽", () => {
    auditLog.record("user789", "VIEW_REPORT", { reportId: "RPT001", dateRange: "today" });
    const logs = auditLog.getAllLogs();
    expect(logs[0].details.reportId).toBe("RPT001");
    expect(logs[0].details.dateRange).toBe("today");
  });

  test("處理空或無效的詳細資訊物件", () => {
    auditLog.record("user101", "EMPTY_DETAILS", null);
    auditLog.record("user102", "STRING_DETAILS", "some string");
    const logs = auditLog.getAllLogs();
    expect(logs[0].details).toBe(null);
    expect(logs[1].details).toBe("some string");
  });
});
