/**
 * 前言：本檔案提供分潤、交易和結算相關的 API 呼叫
 * 用途：分潤規則、交易查詢、結算查詢等操作
 * 維護者：開發團隊
 */

import axiosInstance from './client';
import { Commission, Transaction, Settlement, Withdrawal, ApiResponse, PaginatedResponse, TransactionFilter } from '../types';

/**
 * 獲取分潤規則
 */
export const getCommissionRules = (): Promise<ApiResponse<any[]>> => {
  return axiosInstance.get('/commissions/rules');
};

/**
 * 設定分潤規則
 */
export const setCommissionRules = (data: any): Promise<ApiResponse<any>> => {
  return axiosInstance.post('/commissions/rules', data);
};

/**
 * 獲取分潤記錄
 */
export const getCommissionRecords = (
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<Commission>>> => {
  return axiosInstance.get('/commissions/records', {
    params: { page, page_size: pageSize },
  });
};

/**
 * 獲取分潤報表
 */
export const getCommissionReport = (
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<any>> => {
  return axiosInstance.get('/commissions/report', {
    params: { start_date: startDate, end_date: endDate },
  });
};

/**
 * 獲取交易記錄
 */
export const getTransactions = (
  filter: TransactionFilter
): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
  return axiosInstance.get('/transactions', { params: filter });
};

/**
 * 獲取交易詳情
 */
export const getTransactionDetail = (transactionId: number): Promise<ApiResponse<Transaction>> => {
  return axiosInstance.get(`/transactions/${transactionId}`);
};

/**
 * 獲取結算單
 */
export const getSettlements = (
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<Settlement>>> => {
  return axiosInstance.get('/settlements', {
    params: { page, page_size: pageSize },
  });
};

/**
 * 獲取結算單詳情
 */
export const getSettlementDetail = (settlementId: number): Promise<ApiResponse<Settlement>> => {
  return axiosInstance.get(`/settlements/${settlementId}`);
};

/**
 * 獲取提現記錄
 */
export const getWithdrawals = (
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<Withdrawal>>> => {
  return axiosInstance.get('/withdrawals', {
    params: { page, page_size: pageSize },
  });
};

/**
 * 申請提現
 */
export const requestWithdrawal = (
  amount: number,
  bankAccount?: string
): Promise<ApiResponse<Withdrawal>> => {
  return axiosInstance.post('/withdrawals', {
    amount,
    bank_account: bankAccount,
  });
};

/**
 * 獲取提現詳情
 */
export const getWithdrawalDetail = (withdrawalId: number): Promise<ApiResponse<Withdrawal>> => {
  return axiosInstance.get(`/withdrawals/${withdrawalId}`);
};
