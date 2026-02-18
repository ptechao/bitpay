
/**
 * @file tests/unit/settlementCalculator.test.js
 * @description 聚合支付平台結算計算器的單元測試。
 *              測試交易金額、佣金、退款等對結算金額的影響。
 * @author Manus AI
 * @date 2026-02-19
 */

// 模擬一個簡單的結算計算器
const settlementCalculator = {
  /**
   * 計算單筆交易的結算金額。
   * @param {object} transaction - 交易物件，包含 amount, commission, refundAmount (可選)。
   * @returns {number} 結算金額。
   */
  calculateTransactionSettlement: (transaction) => {
    if (!transaction || typeof transaction.amount !== 'number' || typeof transaction.commission !== 'number') {
      throw new Error('無效的交易物件，缺少金額或佣金。');
    }
    if (transaction.amount < 0 || transaction.commission < 0 || (transaction.refundAmount && transaction.refundAmount < 0)) {
      throw new Error('金額、佣金和退款金額不能為負數。');
    }

    let settlementAmount = transaction.amount - transaction.commission;
    if (transaction.refundAmount) {
      settlementAmount -= transaction.refundAmount;
    }
    return parseFloat(settlementAmount.toFixed(4));
  },

  /**
   * 計算多筆交易的總結算金額。
   * @param {Array<object>} transactions - 交易物件陣列。
   * @returns {number} 總結算金額。
   */
  calculateBatchSettlement: (transactions) => {
    if (!Array.isArray(transactions)) {
      throw new Error('交易列表必須是一個陣列。');
    }
    return transactions.reduce((total, transaction) => {
      return total + settlementCalculator.calculateTransactionSettlement(transaction);
    }, 0);
  },

  /**
   * 計算商戶在特定週期內的總結算金額。
   * @param {Array<object>} merchantTransactions - 屬於某商戶的交易物件陣列。
   * @returns {object} 包含總收入、總佣金、總退款和最終結算金額的物件。
   */
  calculateMerchantPeriodSettlement: (merchantTransactions) => {
    if (!Array.isArray(merchantTransactions)) {
      throw new Error('商戶交易列表必須是一個陣列。');
    }

    let totalAmount = 0;
    let totalCommission = 0;
    let totalRefund = 0;

    merchantTransactions.forEach(tx => {
      totalAmount += tx.amount;
      totalCommission += tx.commission;
      if (tx.refundAmount) {
        totalRefund += tx.refundAmount;
      }
    });

    const finalSettlement = totalAmount - totalCommission - totalRefund;

    return {
      totalAmount: parseFloat(totalAmount.toFixed(4)),
      totalCommission: parseFloat(totalCommission.toFixed(4)),
      totalRefund: parseFloat(totalRefund.toFixed(4)),
      finalSettlement: parseFloat(finalSettlement.toFixed(4)),
    };
  },
};

describe('Settlement Calculator', () => {
  test('應該正確計算單筆交易的結算金額', () => {
    const transaction = { amount: 1000, commission: 10 };
    expect(settlementCalculator.calculateTransactionSettlement(transaction)).toBe(990);
  });

  test('應該正確計算包含退款的單筆交易結算金額', () => {
    const transaction = { amount: 1000, commission: 10, refundAmount: 50 };
    expect(settlementCalculator.calculateTransactionSettlement(transaction)).toBe(940);
  });

  test('單筆交易結算應處理零佣金和零退款', () => {
    const transaction = { amount: 500, commission: 0 };
    expect(settlementCalculator.calculateTransactionSettlement(transaction)).toBe(500);
  });

  test('單筆交易結算應處理無效輸入', () => {
    expect(() => settlementCalculator.calculateTransactionSettlement(null)).toThrow('無效的交易物件，缺少金額或佣金。');
    expect(() => settlementCalculator.calculateTransactionSettlement({ amount: 100 })).toThrow('無效的交易物件，缺少金額或佣金。');
    expect(() => settlementCalculator.calculateTransactionSettlement({ commission: 10 })).toThrow('無效的交易物件，缺少金額或佣金。');
    expect(() => settlementCalculator.calculateTransactionSettlement({ amount: -100, commission: 10 })).toThrow('金額、佣金和退款金額不能為負數。');
    expect(() => settlementCalculator.calculateTransactionSettlement({ amount: 100, commission: -10 })).toThrow('金額、佣金和退款金額不能為負數。');
    expect(() => settlementCalculator.calculateTransactionSettlement({ amount: 100, commission: 10, refundAmount: -5 })).toThrow('金額、佣金和退款金額不能為負數。');
  });

  test('應該正確計算多筆交易的總結算金額', () => {
    const transactions = [
      { amount: 1000, commission: 10 },
      { amount: 500, commission: 5, refundAmount: 20 },
      { amount: 200, commission: 2 },
    ];
    // (1000 - 10) + (500 - 5 - 20) + (200 - 2) = 990 + 475 + 198 = 1663
    expect(settlementCalculator.calculateBatchSettlement(transactions)).toBe(1663);
  });

  test('多筆交易結算應處理空陣列', () => {
    expect(settlementCalculator.calculateBatchSettlement([])).toBe(0);
  });

  test('多筆交易結算應處理無效輸入', () => {
    expect(() => settlementCalculator.calculateBatchSettlement(null)).toThrow('交易列表必須是一個陣列。');
    expect(() => settlementCalculator.calculateBatchSettlement({})).toThrow('交易列表必須是一個陣列。');
  });

  test('應該正確計算商戶在特定週期內的總結算金額', () => {
    const merchantTransactions = [
      { amount: 1000, commission: 10 },
      { amount: 500, commission: 5, refundAmount: 20 },
      { amount: 200, commission: 2 },
    ];
    const result = settlementCalculator.calculateMerchantPeriodSettlement(merchantTransactions);
    expect(result.totalAmount).toBe(1700);
    expect(result.totalCommission).toBe(17);
    expect(result.totalRefund).toBe(20);
    expect(result.finalSettlement).toBe(1663);
  });

  test('商戶週期結算應處理空陣列', () => {
    const result = settlementCalculator.calculateMerchantPeriodSettlement([]);
    expect(result.totalAmount).toBe(0);
    expect(result.totalCommission).toBe(0);
    expect(result.totalRefund).toBe(0);
    expect(result.finalSettlement).toBe(0);
  });

  test('商戶週期結算應處理無效輸入', () => {
    expect(() => settlementCalculator.calculateMerchantPeriodSettlement(null)).toThrow('商戶交易列表必須是一個陣列。');
    expect(() => settlementCalculator.calculateMerchantPeriodSettlement({})).toThrow('商戶交易列表必須是一個陣列。');
  });
});
