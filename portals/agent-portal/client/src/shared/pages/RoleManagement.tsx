/**
 * @file shared/pages/RoleManagement.tsx
 * @description 角色管理頁面範例 (React TypeScript)。
 * @author Manus AI
 * @date 2026-02-19
 */

import React, { useState, useEffect } from 'react';

interface Permission {
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions?: string[]; // 權限名稱列表
}

interface User {
  id: string;
  email: string;
}

const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleDescription, setNewRoleDescription] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedUserRoles, setSelectedUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 模擬 API 請求
  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      // 模擬獲取權限定義
      const mockPermissions: Permission[] = [
        { name: 'order.view', description: '查看訂單' },
        { name: 'order.create', description: '創建訂單' },
        { name: 'settlement.view', description: '查看結算單' },
        { name: 'settlement.withdraw', description: '結算提現' },
        { name: 'agent.create', description: '創建代理' },
        { name: 'merchant.create', description: '創建商戶' },
        { name: 'channel.manage', description: '管理支付通道' },
        { name: 'risk.manage', description: '管理風控規則' },
        { name: 'system.settings', description: '管理系統設定' },
        { name: 'rbac.role.manage', description: '管理角色' },
        { name: 'rbac.user.role.assign', description: '指派使用者角色' },
        { name: 'audit.log.view', description: '查看操作日誌' },
      ];
      setPermissions(mockPermissions);

      // 模擬獲取所有角色
      const mockRoles: Role[] = [
        { id: 'role-admin', name: 'Admin', description: '系統管理員', permissions: ['order.view', 'order.create', 'settlement.view', 'settlement.withdraw', 'agent.create', 'merchant.create', 'channel.manage', 'risk.manage', 'system.settings', 'rbac.role.manage', 'rbac.user.role.assign', 'audit.log.view'] },
        { id: 'role-merchant', name: 'Merchant', description: '商戶', permissions: ['order.view', 'order.create', 'settlement.view'] },
        { id: 'role-agent', name: 'Agent', description: '代理', permissions: ['order.view', 'agent.create', 'merchant.create'] },
      ];
      setRoles(mockRoles);

      // 模擬獲取使用者列表
      const mockUsers: User[] = [
        { id: 'user-1', email: 'admin@example.com' },
        { id: 'user-2', email: 'merchant1@example.com' },
        { id: 'user-3', email: 'agent1@example.com' },
      ];
      setUsers(mockUsers);

    } catch (err) {
      setError('載入角色和權限失敗。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const handleCreateRole = async () => {
    if (!newRoleName) {
      alert('角色名稱不能為空。');
      return;
    }
    setLoading(true);
    try {
      // 模擬 API 請求
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: newRoleName,
        description: newRoleDescription,
        permissions: selectedPermissions,
      };
      setRoles([...roles, newRole]);
      setNewRoleName('');
      setNewRoleDescription('');
      setSelectedPermissions([]);
      alert('角色創建成功！');
    } catch (err) {
      setError('創建角色失敗。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRolePermissions = async (roleId: string) => {
    setLoading(true);
    try {
      // 模擬 API 請求
      setRoles(roles.map(role =>
        role.id === roleId ? { ...role, permissions: selectedPermissions } : role
      ));
      alert('角色權限更新成功！');
    } catch (err) {
      setError('更新角色權限失敗。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUserRoles = async () => {
    if (!selectedUser || selectedUserRoles.length === 0) {
      alert('請選擇使用者並至少指派一個角色。');
      return;
    }
    setLoading(true);
    try {
      // 模擬 API 請求
      console.log(`為使用者 ${selectedUser} 指派角色: ${selectedUserRoles.join(', ')}`);
      alert('使用者角色指派成功！');
    } catch (err) {
      setError('指派使用者角色失敗。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRolePermissionChange = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleUserRoleChange = (roleId: string) => {
    setSelectedUserRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleUserSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    if (userId) {
      setLoading(true);
      try {
        // 模擬獲取使用者現有角色
        const user = users.find(u => u.id === userId);
        if (user) {
          // 這裡應該是從 API 獲取使用者角色，目前簡化為假設 admin@example.com 有 Admin 角色
          setSelectedUserRoles(userId === 'user-1' ? ['role-admin'] : []);
        }
      } catch (err) {
        setError('獲取使用者角色失敗。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedUserRoles([]);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>RBAC 角色管理</h1>

      {loading && <p>載入中...</p>}
      {error && <p style={{ color: 'red' }}>錯誤: {error}</p>}

      <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h2>創建新角色</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>角色名稱:</label>
          <input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>角色描述:</label>
          <input
            type="text"
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <h3>分配權限:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {permissions.map(perm => (
              <label key={perm.name}>
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(perm.name)}
                  onChange={() => handleRolePermissionChange(perm.name)}
                />
                {perm.description} ({perm.name})
              </label>
            ))}
          </div>
        </div>
        <button onClick={handleCreateRole} disabled={loading}>創建角色</button>
      </div>

      <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h2>現有角色</h2>
        {roles.length === 0 && <p>沒有找到任何角色。</p>}
        {roles.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>名稱</th>
                <th style={tableHeaderStyle}>描述</th>
                <th style={tableHeaderStyle}>權限</th>
                <th style={tableHeaderStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id}>
                  <td style={tableCellStyle}>{role.id.substring(0, 8)}...</td>
                  <td style={tableCellStyle}>{role.name}</td>
                  <td style={tableCellStyle}>{role.description}</td>
                  <td style={tableCellStyle}>{(role.permissions || []).join(', ')}</td>
                  <td style={tableCellStyle}>
                    {/* 這裡可以添加編輯和刪除角色的按鈕 */}
                    <button onClick={() => alert(`編輯角色 ${role.name}`)} disabled={loading}>編輯</button>
                    <button onClick={() => alert(`刪除角色 ${role.name}`)} disabled={loading} style={{ marginLeft: '5px' }}>刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h2>指派使用者角色</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>選擇使用者:</label>
          <select value={selectedUser} onChange={handleUserSelect} style={{ marginLeft: '10px' }}>
            <option value="">-- 請選擇使用者 --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.email} ({user.id.substring(0, 8)}...)
              </option>
            ))}
          </select>
        </div>
        {selectedUser && (
          <div style={{ marginBottom: '10px' }}>
            <h3>指派角色給 {users.find(u => u.id === selectedUser)?.email}:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {roles.map(role => (
                <label key={role.id}>
                  <input
                    type="checkbox"
                    checked={selectedUserRoles.includes(role.id)}
                    onChange={() => handleUserRoleChange(role.id)}
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </div>
        )}
        <button onClick={handleAssignUserRoles} disabled={loading || !selectedUser || selectedUserRoles.length === 0}>指派角色</button>
      </div>
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

export default RoleManagementPage;
