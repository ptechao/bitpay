/**
 * 前言：此檔案為身份驗證相關 API 的 Mock 路由，模擬登入、登出及獲取使用者資訊。
 */

const express = require('express');
const router = express.Router();

// 登入
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@example.com' && password === 'password') {
    res.json({
      code: 200,
      message: '登入成功',
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSJ9',
        user: { id: 1, email: 'admin@example.com', role: 'ADMIN' }
      }
    });
  } else {
    res.status(401).json({ code: 401, message: '帳號或密碼錯誤' });
  }
});

// 登出
router.post('/logout', (req, res) => {
  res.json({ code: 200, message: '登出成功' });
});

module.exports = router;
