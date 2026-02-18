/**
 * @file dashboard.js
 * @description 儀表板相關的 API 服務。
 * @author Manus AI
 * @date 2026-02-19
 */

import request from '../config/axios';

/**
 * 獲取儀表板統計數據
 * @returns {Promise<object>} - 儀表板統計數據
 */
export function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get',
  });
}
