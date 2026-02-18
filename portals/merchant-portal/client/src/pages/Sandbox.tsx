
/**
 * @file portals/merchant-portal/client/src/pages/Sandbox.tsx
 * @description 聚合支付平台商戶門戶的沙盒測試面板。
 *              提供商戶測試訂單創建、支付模擬和回調接收的功能。
 * @author Manus AI
 * @date 2026-02-19
 */

import React, { useState } from 'react';
import axios from 'axios';

interface Order {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  orderRef: string;
  notifyUrl: string;
  status: string;
  paymentTime?: string;
}

const Sandbox: React.FC = () => {
  const [merchantId, setMerchantId] = useState<string>('merchant_test_001');
  const [amount, setAmount] = useState<number>(100.00);
  const [currency, setCurrency] = useState<string>('TWD');
  const [orderRef, setOrderRef] = useState<string>(`ORDER-${Date.now()}`);
  const [notifyUrl, setNotifyUrl] = useState<string>('http://localhost:3000/api/merchant/callback'); // 假設商戶回調地址
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('SUCCESS');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const createOrder = async () => {
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://localhost:3001/api/sandbox/orders', {
        merchantId,
        amount,
        currency,
        orderRef,
        notifyUrl,
      });
      if (response.data.code === '200') {
        setCreatedOrder(response.data.data);
        setMessage('訂單創建成功！');
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const simulatePayment = async () => {
    setMessage('');
    setError('');
    if (!createdOrder) {
      setError('請先創建訂單！');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/api/sandbox/payments/simulate', {
        orderId: createdOrder.id,
        paymentStatus,
      });
      if (response.data.code === '200') {
        setMessage('支付模擬請求已發送！');
        // 重新查詢訂單狀態
        await getOrderDetails(createdOrder.id);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const getOrderDetails = async (orderId: string) => {
    setMessage('');
    setError('');
    try {
      const response = await axios.get(`http://localhost:3001/api/sandbox/orders/${orderId}`);
      if (response.data.code === '200') {
        setCreatedOrder(response.data.data);
        setMessage('訂單狀態已更新！');
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>沙盒測試面板</h1>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h2>1. 創建訂單</h2>
        <div>
          <label>商戶 ID:</label>
          <input type="text" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} style={{ width: '100%', padding: '8px', margin: '5px 0' }} />
        </div>
        <div>
          <label>金額:</label>
          <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} style={{ width: '100%', padding: '8px', margin: '5px 0' }} />
        </div>
        <div>
          <label>幣別:</label>
          <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ width: '100%', padding: '8px', margin: '5px 0' }} />
        </div>
        <div>
          <label>商戶訂單參考號:</label>
          <input type="text" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} style={{ width: '100%', padding: '8px', margin: '5px 0' }} />
        </div>
        <div>
          <label>回調 URL:</label>
          <input type="text" value={notifyUrl} onChange={(e) => setNotifyUrl(e.target.value)} style={{ width: '100%', padding: '8px', margin: '5px 0' }} />
        </div>
        <button onClick={createOrder} style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer' }}>創建訂單</button>
      </section>

      {createdOrder && (
        <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
          <h2>2. 模擬支付</h2>
          <p><strong>訂單 ID:</strong> {createdOrder.id}</p>
          <p><strong>當前狀態:</strong> {createdOrder.status}</p>
          <div>
            <label>模擬支付狀態:</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} style={{ width: '100%', padding: '8px', margin: '5px 0' }}>
              <option value="SUCCESS">成功</option>
              <option value="FAILED">失敗</option>
              <option value="TIMEOUT">超時</option>
            </select>
          </div>
          <button onClick={simulatePayment} style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer' }}>模擬支付</button>
        </section>
      )}

      {createdOrder && (
        <section style={{ border: '1px solid #ccc', padding: '15px' }}>
          <h2>3. 訂單詳情</h2>
          <p><strong>訂單 ID:</strong> {createdOrder.id}</p>
          <p><strong>商戶 ID:</strong> {createdOrder.merchantId}</p>
          <p><strong>金額:</strong> {createdOrder.amount} {createdOrder.currency}</p>
          <p><strong>商戶訂單參考號:</strong> {createdOrder.orderRef}</p>
          <p><strong>回調 URL:</strong> {createdOrder.notifyUrl}</p>
          <p><strong>狀態:</strong> {createdOrder.status}</p>
          {createdOrder.paymentTime && <p><strong>支付時間:</strong> {new Date(createdOrder.paymentTime).toLocaleString()}</p>}
          <button onClick={() => getOrderDetails(createdOrder.id)} style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer' }}>刷新訂單狀態</button>
        </section>
      )}
    </div>
  );
};

export default Sandbox;
