/**
 * 前言：此檔案為 Adapter 工廠，負責根據通道代碼自動載入並實例化對應的 Adapter。
 * 實現通道接入的解耦與動態載入。
 */

const ExampleAdapter = require('./ExampleAdapter');
// const AlipayAdapter = require('./AlipayAdapter');
// const WeChatAdapter = require('./WeChatAdapter');

class AdapterFactory {
  /**
   * 獲取通道 Adapter 實例
   * @param {string} channelCode - 通道代碼 (如 ALIPAY, WECHAT, EXAMPLE)
   * @param {Object} config - 通道配置資訊
   * @returns {BaseAdapter} - 對應的 Adapter 實例
   */
  static getAdapter(channelCode, config) {
    switch (channelCode.toUpperCase()) {
      case 'EXAMPLE':
        return new ExampleAdapter(config);
      // case 'ALIPAY':
      //   return new AlipayAdapter(config);
      // case 'WECHAT':
      //   return new WeChatAdapter(config);
      default:
        throw new Error(`Unsupported channel: ${channelCode}`);
    }
  }
}

module.exports = AdapterFactory;
