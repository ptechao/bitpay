
/**
 * @file jest.config.js
 * @description Jest 測試框架的配置檔案。
 *              定義了測試的環境、報告和覆蓋率選項。
 * @author Manus AI
 * @date 2026-02-19
 */

module.exports = {
  testEnvironment: 'node',
  // 測試檔案的匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.ts',
  ],
  // 模組檔案擴展名
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  // 測試覆蓋率報告的目錄
  coverageDirectory: 'coverage',
  // 收集覆蓋率的檔案模式
  collectCoverageFrom: [
    'services/**/*.js',
    'src/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  // 報告覆蓋率的格式
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // 設置模組別名，如果專案中有使用
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // 設置測試前執行的檔案，例如設定環境變數或初始化資料庫連線
  setupFiles: [],
  // 設置測試前執行的檔案，但會在每個測試檔案執行前執行一次
  setupFilesAfterEnv: [],
  // 忽略轉換的模組，通常是 node_modules
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  // 顯示詳細的測試報告
  verbose: true,
};
