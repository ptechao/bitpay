
/**
 * @file tests/unit/commissionEngine.test.js
 * @description 聚合支付平台佣金計算引擎的單元測試。
 *              測試不同規則下的佣金計算邏輯。
 * @author Manus AI
 * @date 2026-02-19
 */

// 模擬一個簡單的佣金計算引擎
const commissionEngine = {
  /**
   * 根據交易金額和佣金率計算佣金。
   * @param {number} amount - 交易金額。
   * @param {number} rate - 佣金率 (例如 0.01 代表 1%)。
   * @returns {number} 計算出的佣金金額。
   */
  calculateFixedRateCommission: (amount, rate) => {
    if (amount <= 0 || rate < 0) {
      throw new Error("金額和佣金率必須為正數或零。");
    }
    return parseFloat((amount * rate).toFixed(4)); // 保留四位小數
  },

  /**
   * 根據交易金額、佣金率和最低/最高佣金計算佣金。
   * @param {number} amount - 交易金額。
   * @param {number} rate - 佣金率。
   * @param {number} minCommission - 最低佣金。
   * @param {number} maxCommission - 最高佣金。
   * @returns {number} 計算出的佣金金額。
   */
  calculateTieredCommission: (amount, rate, minCommission, maxCommission) => {
    if (amount <= 0 || rate < 0 || minCommission < 0 || maxCommission < 0) {
      throw new Error("所有參數必須為正數或零。");
    }
    let commission = commissionEngine.calculateFixedRateCommission(amount, rate);
    commission = Math.max(commission, minCommission);
    commission = Math.min(commission, maxCommission);
    return commission;
  },

  /**
   * 根據不同的支付方式應用不同的佣金規則。
   * @param {number} amount - 交易金額。
   * @param {string} paymentMethod - 支付方式 (e.g., 'CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET')。
   * @returns {number} 計算出的佣金金額。
   */
  calculateCommissionByPaymentMethod: (amount, paymentMethod) => {
    const rules = {
      CREDIT_CARD: { rate: 0.025, min: 1, max: 50 },
      BANK_TRANSFER: { rate: 0.005, min: 0.5, max: 10 },
      E_WALLET: { rate: 0.01, min: 0.8, max: 20 },
      DEFAULT: { rate: 0.015, min: 0.5, max: 30 },
    };

    const rule = rules[paymentMethod] || rules.DEFAULT;
    return commissionEngine.calculateTieredCommission(amount, rule.rate, rule.min, rule.max);
  },
};

describe("Commission Engine", () => {
  test("應該正確計算固定費率佣金", () => {
    expect(commissionEngine.calculateFixedRateCommission(1000, 0.01)).toBe(10);
    expect(commissionEngine.calculateFixedRateCommission(500, 0.02)).toBe(10);
    expect(commissionEngine.calculateFixedRateCommission(0, 0.01)).toBe(0);
    expect(commissionEngine.calculateFixedRateCommission(1234.56, 0.0075)).toBe(9.2592);
  });

  test("固定費率佣金計算應處理無效輸入", () => {
    expect(() => commissionEngine.calculateFixedRateCommission(-100, 0.01)).toThrow("金額和佣金率必須為正數或零。");
    expect(() => commissionEngine.calculateFixedRateCommission(100, -0.01)).toThrow("金額和佣金率必須為正數或零。");
  });

  test("應該正確計算分級佣金，並應用最低和最高限制", () => {
    // 低於最低佣金
    expect(commissionEngine.calculateTieredCommission(100, 0.01, 5, 50)).toBe(5);
    // 高於最高佣金
    expect(commissionEngine.calculateTieredCommission(5000, 0.01, 5, 20)).toBe(20);
    // 在範圍內
    expect(commissionEngine.calculateTieredCommission(1000, 0.01, 5, 20)).toBe(10);
    // 邊界情況
    expect(commissionEngine.calculateTieredCommission(500, 0.01, 5, 5)).toBe(5);
  });

  test("分級佣金計算應處理無效輸入", () => {
    expect(() => commissionEngine.calculateTieredCommission(-100, 0.01, 5, 50)).toThrow("所有參數必須為正數或零。");
    expect(() => commissionEngine.calculateTieredCommission(100, -0.01, 5, 50)).toThrow("所有參數必須為正數或零。");
    expect(() => commissionEngine.calculateTieredCommission(100, 0.01, -5, 50)).toThrow("所有參數必須為正數或零。");
    expect(() => commissionEngine.calculateTieredCommission(100, 0.01, 5, -50)).toThrow("所有參數必須為正數或零。");
  });

  test("應該根據支付方式計算佣金", () => {
    expect(commissionEngine.calculateCommissionByPaymentMethod(1000, "CREDIT_CARD")).toBe(25); // 1000 * 0.025 = 25
    expect(commissionEngine.calculateCommissionByPaymentMethod(100, "CREDIT_CARD")).toBe(2.5); // 100 * 0.025 = 2.5, > min 1
    expect(commissionEngine.calculateCommissionByPaymentMethod(10, "CREDIT_CARD")).toBe(1); // 10 * 0.025 = 0.25, < min 1, so 1
    expect(commissionEngine.calculateCommissionByPaymentMethod(3000, "CREDIT_CARD")).toBe(50); // 3000 * 0.025 = 75, > max 50, so 50

    expect(commissionEngine.calculateCommissionByPaymentMethod(1000, "BANK_TRANSFER")).toBe(5); // 1000 * 0.005 = 5
    expect(commissionEngine.calculateCommissionByPaymentMethod(50, "BANK_TRANSFER")).toBe(0.5); // 50 * 0.005 = 0.25, < min 0.5, so 0.5
    expect(commissionEngine.calculateCommissionByPaymentMethod(3000, "BANK_TRANSFER")).toBe(10); // 3000 * 0.005 = 15, > max 10, so 10

    expect(commissionEngine.calculateCommissionByPaymentMethod(1000, "E_WALLET")).toBe(10); // 1000 * 0.01 = 10
    expect(commissionEngine.calculateCommissionByPaymentMethod(50, "E_WALLET")).toBe(0.8); // 50 * 0.01 = 0.5, < min 0.8, so 0.8
    expect(commissionEngine.calculateCommissionByPaymentMethod(3000, "E_WALLET")).toBe(20); // 3000 * 0.01 = 30, > max 20, so 20

    // 測試預設規則
    expect(commissionEngine.calculateCommissionByPaymentMethod(1000, "UNKNOWN_METHOD")).toBe(15); // 1000 * 0.015 = 15
  });
});
