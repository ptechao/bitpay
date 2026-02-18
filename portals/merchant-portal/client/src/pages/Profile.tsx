/**
 * 前言：此檔案為商戶端個人設定頁面，包含修改密碼、商戶基本資訊編輯及結算帳戶設定。
 * 使用 React + TypeScript + shadcn/ui 實作。
 */

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Lock, 
  Wallet, 
  Building2, 
  Save, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";
import { useTranslation } from 'react-i18next';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const [merchantInfo, setMerchantInfo] = useState({
    name: '全球支付有限公司',
    email: 'contact@globalpay.com',
    phone: '+886 912 345 678',
    address: '台北市信義區信義路五段7號'
  });

  const [settlementInfo, setSettlementInfo] = useState({
    bankName: '中國信託商業銀行',
    bankAccount: '123-456-789012',
    accountName: '全球支付有限公司',
    cryptoWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">個人設定</h1>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex gap-2"><Building2 className="h-4 w-4" /> 商戶基本資訊</TabsTrigger>
          <TabsTrigger value="settlement" className="flex gap-2"><Wallet className="h-4 w-4" /> 結算帳戶設定</TabsTrigger>
          <TabsTrigger value="security" className="flex gap-2"><Lock className="h-4 w-4" /> 安全設定</TabsTrigger>
        </TabsList>

        {/* 商戶基本資訊編輯 */}
        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>商戶基本資訊</CardTitle>
              <CardDescription>管理您的商戶名稱、聯絡方式與地址。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant-name">商戶名稱</Label>
                  <Input id="merchant-name" value={merchantInfo.name} onChange={(e) => setMerchantInfo({...merchantInfo, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant-email">聯絡信箱</Label>
                  <Input id="merchant-email" type="email" value={merchantInfo.email} onChange={(e) => setMerchantInfo({...merchantInfo, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant-phone">聯絡電話</Label>
                  <Input id="merchant-phone" value={merchantInfo.phone} onChange={(e) => setMerchantInfo({...merchantInfo, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant-address">公司地址</Label>
                  <Input id="merchant-address" value={merchantInfo.address} onChange={(e) => setMerchantInfo({...merchantInfo, address: e.target.value})} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="flex gap-2"><Save className="h-4 w-4" /> 儲存變更</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 結算帳戶設定 */}
        <TabsContent value="settlement" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>結算帳戶設定</CardTitle>
              <CardDescription>設定您的銀行帳號或加密貨幣錢包地址，用於接收結算資金。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> 銀行帳戶 (法幣)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank-name">銀行名稱</Label>
                    <Input id="bank-name" value={settlementInfo.bankName} onChange={(e) => setSettlementInfo({...settlementInfo, bankName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-name">戶名</Label>
                    <Input id="account-name" value={settlementInfo.accountName} onChange={(e) => setSettlementInfo({...settlementInfo, accountName: e.target.value})} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bank-account">銀行帳號</Label>
                    <Input id="bank-account" value={settlementInfo.bankAccount} onChange={(e) => setSettlementInfo({...settlementInfo, bankAccount: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> 加密貨幣錢包 (USDT)</h3>
                <div className="space-y-2">
                  <Label htmlFor="crypto-wallet">錢包地址 (ERC20/TRC20)</Label>
                  <Input id="crypto-wallet" value={settlementInfo.cryptoWallet} onChange={(e) => setSettlementInfo({...settlementInfo, cryptoWallet: e.target.value})} />
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> 請務必確認地址正確，錯誤的地址將導致資金無法找回。
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="flex gap-2"><Save className="h-4 w-4" /> 儲存結算資訊</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 安全設定 (修改密碼) */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>安全設定</CardTitle>
              <CardDescription>定期更換密碼以保護您的帳戶安全。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password">目前密碼</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新密碼</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">確認新密碼</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <div className="pt-4 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <ShieldCheck className="h-4 w-4" /> 雙重驗證 (2FA) 已啟用
                </div>
                <Button variant="outline" size="sm">管理 2FA</Button>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="flex gap-2"><Save className="h-4 w-4" /> 更新密碼</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
