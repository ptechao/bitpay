/**
 * 前言：此檔案為商戶管理相關 API 的 Mock 路由，模擬商戶 CRUD 操作。
 */

const express = require('express');
const router = express.Router();

// 獲取商戶列表
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '全球支付有限公司', email: 'contact@globalpay.com', status: 'ACTIVE' },
      { id: 2, name: '電子商務有限公司', email: 'sales@ecommerce.com', status: 'PENDING' }
    ]
  });
});

// 獲取單個商戶詳情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: { id, name: '全球支付有限公司', email: 'contact@globalpay.com', status: 'ACTIVE' }
  });
});

// 更新商戶資訊
router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: '商戶資訊更新成功',
    data: { id, ...req.body }
  });
});

module.exports = router;
