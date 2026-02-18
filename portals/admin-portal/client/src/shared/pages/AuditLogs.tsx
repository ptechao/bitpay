/**
 * @file shared/pages/AuditLogs.tsx
 * @description 操作日誌查詢頁面範例 (React TypeScript)。
 * @author Manus AI
 * @date 2026-02-19
 */

import React, { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  operator_id: string;
  operator_role: string;
  action_type: string;
  target_entity: string;
  target_id: string | null;
  request_params: object;
  ip_address: string;
  action_result: string;
  error_message: string | null;
  created_at: string;
}

interface AuditLogFilters {
  operatorId?: string;
  actionType?: string;
  targetEntity?: string;
  actionResult?: string;
  startDate?: string;
  endDate?: string;
}

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 模擬 API 請求
  const fetchAuditLogs = async (currentFilters: AuditLogFilters) => {
    setLoading(true);
    setError(null);
    try {
      // 這裡應該替換為實際的 API 請求
      // const response = await fetch('/api/audit-logs', { method: 'POST', body: JSON.stringify(currentFilters) });
      // const data = await response.json();

      // 模擬數據
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          operator_id: 'user-123',
          operator_role: 'admin',
          action_type: 'CREATE',
          target_entity: '/api/merchants',
          target_id: 'merchant-abc',
          request_params: { name: 'Test Merchant' },
          ip_address: '192.168.1.1',
          action_result: 'success',
          error_message: null,
          created_at: '2026-02-18T10:00:00Z',
        },
        {
          id: '2',
          operator_id: 'merchant-abc',
          operator_role: 'merchant',
          action_type: 'UPDATE',
          target_entity: '/api/orders/order-xyz',
          target_id: 'order-xyz',
          request_params: { status: 'PROCESSING' },
          ip_address: '10.0.0.5',
          action_result: 'success',
          error_message: null,
          created_at: '2026-02-18T10:05:00Z',
        },
        {
          id: '3',
          operator_id: 'agent-456',
          operator_role: 'agent',
          action_type: 'READ',
          target_entity: '/api/commissions',
          target_id: null,
          request_params: { agentId: 'agent-456' },
          ip_address: '172.16.0.10',
          action_result: 'success',
          error_message: null,
          created_at: '2026-02-18T10:10:00Z',
        },
        {
            id: '4',
            operator_id: 'user-123',
            operator_role: 'admin',
            action_type: 'DELETE',
            target_entity: '/api/channels/channel-def',
            target_id: 'channel-def',
            request_params: {},
            ip_address: '192.168.1.1',
            action_result: 'failed',
            error_message: '權限不足',
            created_at: '2026-02-18T10:15:00Z',
          },
      ];

      // 根據篩選條件過濾模擬數據
      const filteredLogs = mockLogs.filter(log => {
        if (currentFilters.operatorId && !log.operator_id.includes(currentFilters.operatorId)) return false;
        if (currentFilters.actionType && log.action_type !== currentFilters.actionType) return false;
        if (currentFilters.targetEntity && !log.target_entity.includes(currentFilters.targetEntity)) return false;
        if (currentFilters.actionResult && log.action_result !== currentFilters.actionResult) return false;
        if (currentFilters.startDate && new Date(log.created_at) < new Date(currentFilters.startDate)) return false;
        if (currentFilters.endDate && new Date(log.created_at) > new Date(currentFilters.endDate)) return false;
        return true;
      });

      setLogs(filteredLogs);
    } catch (err) {
      setError('載入日誌失敗。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(filters);
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleExport = async () => {
    try {
      // 這裡應該替換為實際的 API 請求，例如 POST /api/audit-logs/export
      // const response = await fetch('/api/audit-logs/export', { method: 'POST', body: JSON.stringify(filters) });
      // const csvContent = await response.text();

      // 模擬 CSV 內容
      const mockCsvContent = `id,operator_id,operator_role,action_type,target_entity,target_id,request_params,ip_address,action_result,error_message,created_at\n` +
        `1,user-123,admin,CREATE,/api/merchants,merchant-abc,
{\"name\":\"Test Merchant\"},192.168.1.1,success,,2026-02-18T10:00:00Z\n` +
        `2,merchant-abc,merchant,UPDATE,/api/orders/order-xyz,order-xyz,{\"status\":\"PROCESSING\"},10.0.0.5,success,,2026-02-18T10:05:00Z\n` +
        `3,agent-456,agent,READ,/api/commissions,,{\"agentId\":\"agent-456\"},172.16.0.10,success,,2026-02-18T10:10:00Z\n` +
        `4,user-123,admin,DELETE,/api/channels/channel-def,channel-def,{},192.168.1.1,failed,權限不足,2026-02-18T10:15:00Z`;

      const blob = new Blob([mockCsvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'audit_logs.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      alert('日誌已匯出為 audit_logs.csv');
    } catch (err) {
      alert('匯出日誌失敗。');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>操作日誌</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          name="operatorId"
          placeholder="操作者 ID"
          value={filters.operatorId || ''}
          onChange={handleFilterChange}
        />
        <select name="actionType" value={filters.actionType || ''} onChange={handleFilterChange}>
          <option value="">所有操作類型</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="READ">READ</option>
        </select>
        <input
          type="text"
          name="targetEntity"
          placeholder="操作目標實體"
          value={filters.targetEntity || ''}
          onChange={handleFilterChange}
        />
        <select name="actionResult" value={filters.actionResult || ''} onChange={handleFilterChange}>
          <option value="">所有結果</option>
          <option value="success">成功</option>
          <option value="failed">失敗</option>
        </select>
        <input
          type="date"
          name="startDate"
          value={filters.startDate || ''}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate || ''}
          onChange={handleFilterChange}
        />
        <button onClick={() => fetchAuditLogs(filters)} disabled={loading}>查詢</button>
        <button onClick={handleExport} disabled={loading}>匯出 CSV</button>
      </div>

      {loading && <p>載入中...</p>}
      {error && <p style={{ color: 'red' }}>錯誤: {error}</p>}

      {!loading && logs.length === 0 && <p>沒有找到操作日誌。</p>}

      {!loading && logs.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>操作者 ID</th>
              <th style={tableHeaderStyle}>角色</th>
              <th style={tableHeaderStyle}>操作類型</th>
              <th style={tableHeaderStyle}>目標實體</th>
              <th style={tableHeaderStyle}>目標 ID</th>
              <th style={tableHeaderStyle}>請求參數</th>
              <th style={tableHeaderStyle}>IP 位址</th>
              <th style={tableHeaderStyle}>結果</th>
              <th style={tableHeaderStyle}>錯誤訊息</th>
              <th style={tableHeaderStyle}>時間</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={tableCellStyle}>{log.id.substring(0, 8)}...</td>
                <td style={tableCellStyle}>{log.operator_id}</td>
                <td style={tableCellStyle}>{log.operator_role}</td>
                <td style={tableCellStyle}>{log.action_type}</td>
                <td style={tableCellStyle}>{log.target_entity}</td>
                <td style={tableCellStyle}>{log.target_id?.substring(0, 8) || 'N/A'}...</td>
                <td style={tableCellStyle}>{JSON.stringify(log.request_params)}</td>
                <td style={tableCellStyle}>{log.ip_address}</td>
                <td style={tableCellStyle}>{log.action_result}</td>
                <td style={tableCellStyle}>{log.error_message || 'N/A'}</td>
                <td style={tableCellStyle}>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const tableHeaderStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  background: '#f2f2f2',
  textAlign: 'left',
};

const tableCellStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  verticalAlign: 'top',
};

export default AuditLogsPage;
