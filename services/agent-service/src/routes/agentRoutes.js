// 檔案：src/routes/agentRoutes.js
// 說明：定義代理服務的所有 API 路由。

const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { authenticateJWT, authorizeAgent } = require('../middlewares/authMiddleware');

// 代理註冊
router.post('/register', agentController.registerAgent);

// 查詢代理資訊
router.get('/:agentId', authenticateJWT, authorizeAgent, agentController.getAgentInfo);

// 更新代理資訊
router.put('/:agentId', authenticateJWT, authorizeAgent, agentController.updateAgentInfo);

// 開通下級代理
router.post('/:agentId/sub-agents', authenticateJWT, authorizeAgent, agentController.createSubAgent);

// 開通商戶
router.post('/:agentId/merchants', authenticateJWT, authorizeAgent, agentController.createMerchant);

// 查詢下級代理和商戶列表
router.get('/:agentId/subordinates', authenticateJWT, authorizeAgent, agentController.getSubordinates);

// 查詢分潤記錄
router.get('/:agentId/commissions', authenticateJWT, authorizeAgent, agentController.getCommissions);

// 設定分潤規則
router.put('/:agentId/commission-config', authenticateJWT, authorizeAgent, agentController.setCommissionConfig);

module.exports = router;
