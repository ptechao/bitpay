/**
 * 前言：本檔案定義代理管理端的所有 TypeScript 類型和介面
 * 用途：統一管理應用中的資料結構，確保類型安全
 * 維護者：開發團隊
 */

/**
 * 使用者相關類型
 */
export interface User {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
  user_type: 'admin' | 'merchant' | 'agent';
  status: 'active' | 'inactive' | 'suspended';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * 代理相關類型
 */
export interface Agent {
  id: number;
  user_id: number;
  name: string;
  contact_person?: string;
  contact_email: string;
  phone_number?: string;
  status: 'pending' | 'active' | 'suspended';
  parent_agent_id?: number;
  commission_rate_type: 'percentage' | 'fixed' | 'markup';
  base_commission_rate: number;
  markup_rate: number;
  created_at: string;
  updated_at: string;
}

export interface AgentCreateRequest {
  name: string;
  contact_person?: string;
  contact_email: string;
  phone_number?: string;
  commission_rate_type: 'percentage' | 'fixed' | 'markup';
  base_commission_rate: number;
  markup_rate?: number;
}

export interface AgentUpdateRequest extends Partial<AgentCreateRequest> {
  status?: 'pending' | 'active' | 'suspended';
}

/**
 * 商戶相關類型
 */
export interface Merchant {
  id: number;
  user_id: number;
  name: string;
  legal_name?: string;
  contact_person?: string;
  contact_email: string;
  phone_number?: string;
  address?: string;
  website?: string;
  status: 'pending' | 'active' | 'suspended';
  parent_agent_id?: number;
  created_at: string;
  updated_at: string;
}

export interface MerchantCreateRequest {
  name: string;
  legal_name?: string;
  contact_person?: string;
  contact_email: string;
  phone_number?: string;
  address?: string;
  website?: string;
}

export interface MerchantUpdateRequest extends Partial<MerchantCreateRequest> {
  status?: 'pending' | 'active' | 'suspended';
}

/**
 * 分潤相關類型
 */
export interface Commission {
  id: number;
  agent_id: number;
  transaction_id: number;
  commission_amount: number;
  commission_rate: number;
  created_at: string;
}

export interface CommissionRule {
  id: number;
  agent_id: number;
  rule_type: 'percentage' | 'fixed' | 'markup';
  rate: number;
  min_amount?: number;
  max_amount?: number;
  created_at: string;
  updated_at: string;
}

/**
 * 交易相關類型
 */
export interface Transaction {
  id: number;
  order_id: string;
  merchant_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionFilter {
  merchant_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

/**
 * 結算相關類型
 */
export interface Settlement {
  id: number;
  entity_id: number;
  entity_type: 'agent' | 'merchant';
  settlement_period: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: number;
  entity_id: number;
  entity_type: 'agent' | 'merchant';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bank_account?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 儀表板統計相關類型
 */
export interface DashboardStats {
  total_subordinate_agents: number;
  total_merchants: number;
  total_transactions: number;
  total_transaction_amount: number;
  total_commission: number;
  pending_settlement: number;
}

export interface DashboardChartData {
  date: string;
  amount: number;
  commission: number;
}

/**
 * API 響應類型
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * 多語言相關類型
 */
export type LanguageCode = 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'th-TH' | 'vi-VN';

export interface Language {
  code: LanguageCode;
  name: string;
  is_active: boolean;
}
