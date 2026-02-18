/**
 * @file services/payment-service/src/stateMachine/orderStateMachine.js
 * @description 訂單狀態機，處理訂單狀態的流轉、記錄與通知。
 * @author Manus AI
 * @date 2026-02-19
 */

const knex = require('../config/database'); // 假設您有一個 knex 實例的配置
const EventEmitter = require('events');

class OrderStateMachine extends EventEmitter {
    constructor() {
        super();
        this.states = {
            PENDING: 'PENDING',
            PROCESSING: 'PROCESSING',
            SUCCESS: 'SUCCESS',
            FAILED: 'FAILED',
            EXPIRED: 'EXPIRED',
            REFUNDING: 'REFUNDING',
            REFUNDED: 'REFUNDED'
        };

        this.transitions = {
            [this.states.PENDING]: [this.states.PROCESSING, this.states.EXPIRED, this.states.FAILED],
            [this.states.PROCESSING]: [this.states.SUCCESS, this.states.FAILED, this.states.REFUNDING],
            [this.states.SUCCESS]: [this.states.REFUNDING],
            [this.states.FAILED]: [],
            [this.states.EXPIRED]: [],
            [this.states.REFUNDING]: [this.states.REFUNDED, this.states.FAILED], // REFUNDING 狀態下，退款可能失敗
            [this.states.REFUNDED]: []
        };
    }

    /**
     * 檢查狀態轉換是否合法
     * @param {string} fromState - 當前狀態
     * @param {string} toState - 目標狀態
     * @returns {boolean}
     */
    isValidTransition(fromState, toState) {
        return this.transitions[fromState] && this.transitions[fromState].includes(toState);
    }

    /**
     * 執行訂單狀態轉換
     * @param {string} orderId - 訂單 ID (transactions.id)
     * @param {string} newStatus - 目標狀態
     * @param {string} reason - 狀態變更原因
     * @returns {Promise<object>} - 更新後的訂單物件
     */
    async transition(orderId, newStatus, reason = 'N/A') {
        return knex.transaction(async trx => {
            const order = await trx('transactions')
                .where({ id: orderId })
                .select('id', 'status', 'merchant_id')
                .first();

            if (!order) {
                throw new Error(`訂單 ${orderId} 不存在。`);
            }

            const currentStatus = order.status.toUpperCase(); // 確保狀態為大寫

            if (currentStatus === newStatus.toUpperCase()) {
                // 狀態相同，無需轉換，但仍記錄日誌
                await this._logStatusChange(orderId, currentStatus, newStatus.toUpperCase(), reason, trx);
                console.log(`訂單 ${orderId} 狀態已是 ${newStatus.toUpperCase()}，無需轉換。`);
                return order;
            }

            if (!this.isValidTransition(currentStatus, newStatus.toUpperCase())) {
                throw new Error(`訂單 ${orderId} 無法從 ${currentStatus} 轉換到 ${newStatus.toUpperCase()}。`);
            }

            // 更新訂單狀態
            const [updatedOrder] = await trx('transactions')
                .where({ id: orderId })
                .update({ status: newStatus.toUpperCase(), updated_at: knex.fn.now() })
                .returning('*');

            // 記錄狀態變更
            await this._logStatusChange(orderId, currentStatus, newStatus.toUpperCase(), reason, trx);

            // 觸發事件通知商戶
            this.emit('orderStatusChanged', { orderId, oldStatus: currentStatus, newStatus: newStatus.toUpperCase(), merchantId: order.merchant_id });

            return updatedOrder;
        });
    }

    /**
     * 記錄訂單狀態變更到 order_status_logs 表
     * @param {string} orderId - 訂單 ID
     * @param {string} oldStatus - 舊狀態
     * @param {string} newStatus - 新狀態
     * @param {string} reason - 變更原因
     * @param {object} trx - Knex 事務物件
     * @private
     */
    async _logStatusChange(orderId, oldStatus, newStatus, reason, trx) {
        await trx('order_status_logs').insert({
            order_id: orderId,
            old_status: oldStatus,
            new_status: newStatus,
            reason: reason
        });
    }

    /**
     * 獲取所有定義的狀態
     * @returns {string[]}
     */
    getStates() {
        return Object.values(this.states);
    }

    /**
     * 獲取所有定義的轉換規則
     * @returns {object}
     */
    getTransitions() {
        return this.transitions;
    }
}

module.exports = new OrderStateMachine();
