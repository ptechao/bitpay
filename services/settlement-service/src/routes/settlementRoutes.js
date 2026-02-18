// 檔案：src/routes/settlementRoutes.js
// 說明：定義結算服務的所有 API 路由。

const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');
const { authenticateJWT, authorizeEntity } = require('../middlewares/authMiddleware');

// 查詢結算單（商戶或代理）
router.get('/:entityType/:entityId', authenticateJWT, authorizeEntity, settlementController.getSettlements);

// 手動觸發結算
router.post('/trigger', authenticateJWT, settlementController.triggerSettlement);

// 發起提現
router.post('/withdrawals', authenticateJWT, authorizeEntity, settlementController.initiateWithdrawal);

// 查詢提現記錄
router.get('/withdrawals/:withdrawalId', authenticateJWT, authorizeEntity, settlementController.getWithdrawalRecord);

// 結算報表
router.get('/:entityType/:entityId/reports', authenticateJWT, authorizeEntity, settlementController.getSettlementReports);

module.exports = router;
