// services/payment-service/src/config/supabase.js
// 前言：此檔案用於初始化 Supabase 客戶端，提供資料庫連線功能。

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// 初始化 Supabase 客戶端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;
