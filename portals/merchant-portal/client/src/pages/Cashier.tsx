/**
 * 前言：此檔案為商戶端收銀台頁面，包含 API 收銀台使用說明、QR 碼收銀台測試頁面及支付流程圖說明。
 * 使用 React + TypeScript + shadcn/ui 實作。
 */

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode, 
  Code2, 
  Workflow, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  RefreshCw 
} from "lucide-react";
import { useTranslation } from 'react-i18next';

const Cashier: React.FC = () => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('100.00');
  const [currency, setCurrency] = useState('TWD');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateTestQrCode = () => {
    setLoading(true);
    // 模擬 API 請求生成 QR 碼
    setTimeout(() => {
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://pay.example.com/checkout/${Math.random().toString(36).substring(7)}`);
      setLoading(false);
    }, 1000);
  };

  const requestExample = `{
  "merchant_id": "pk_live_51NzX2kL9mR4vS7jP",
  "order_id": "ORD_20240219_001",
  "amount": "100.00",
  "currency": "TWD",
  "channel": "ALIPAY",
  "notify_url": "https://api.merchant.com/v1/pay-notify",
  "return_url": "https://merchant.com/order/success",
  "sign": "E10ADC3949BA59ABBE56E057F20F883E"
}`;

  const responseExample = `{
  "code": 200,
  "message": "success",
  "data": {
    "order_id": "ORD_20240219_001",
    "platform_order_id": "PAY_987654321",
    "pay_url": "https://pay.example.com/checkout/abc123xyz",
    "qr_code": "https://pay.example.com/qr/abc123xyz.png",
    "status": "PENDING"
  }
}`;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">收銀台管理</h1>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api" className="flex gap-2"><Code2 className="h-4 w-4" /> API 收銀台</TabsTrigger>
          <TabsTrigger value="qrcode" className="flex gap-2"><QrCode className="h-4 w-4" /> QR 碼收銀台測試</TabsTrigger>
          <TabsTrigger value="workflow" className="flex gap-2"><Workflow className="h-4 w-4" /> 支付流程說明</TabsTrigger>
        </TabsList>

        {/* API 收銀台使用說明 */}
        <TabsContent value="api" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>請求範例 (Request)</CardTitle>
                <CardDescription>發起支付請求的 JSON 格式範例。</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">
                    <code>{requestExample}</code>
                  </pre>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(requestExample)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>回應範例 (Response)</CardTitle>
                <CardDescription>支付請求成功後的回應資料。</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">
                    <code>{responseExample}</code>
                  </pre>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(responseExample)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* QR 碼收銀台測試頁面 */}
        <TabsContent value="qrcode" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>QR 碼收銀台測試</CardTitle>
              <CardDescription>輸入金額生成測試 QR 碼，模擬使用者掃碼支付流程。</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">測試金額</Label>
                  <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">幣種</Label>
                  <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="TWD" />
                </div>
                <Button className="w-full" onClick={generateTestQrCode} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                  生成測試 QR 碼
                </Button>
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 min-h-[300px]">
                {qrCodeUrl ? (
                  <div className="text-center space-y-4">
                    <img src={qrCodeUrl} alt="Test QR Code" className="mx-auto border p-2 bg-white" />
                    <p className="text-sm text-muted-foreground">請使用手機掃描上方 QR 碼進行測試</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">測試環境</Badge>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <QrCode className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>尚未生成 QR 碼</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 支付流程圖說明 */}
        <TabsContent value="workflow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>支付流程說明</CardTitle>
              <CardDescription>了解從發起支付到回調通知的完整生命週期。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 py-4">
                {[
                  { step: 1, title: "商戶發起支付", desc: "商戶後端調用 /payments 介面，傳送訂單資訊與簽名。" },
                  { step: 2, title: "平台處理請求", desc: "平台驗證簽名、風控審核，並選擇最佳支付通道。" },
                  { step: 3, title: "使用者支付", desc: "使用者透過 QR 碼或跳轉連結在支付通道完成付款。" },
                  { step: 4, title: "通道回調平台", desc: "支付通道將結果通知平台，平台更新訂單狀態。" },
                  { step: 5, title: "平台回調商戶", desc: "平台將最終支付結果通知商戶預設的回調地址。" },
                ].map((item, index) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                      {index !== 4 && <div className="w-0.5 h-12 bg-muted mt-2" />}
                    </div>
                    <div className="pt-1">
                      <h4 className="font-semibold text-lg">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Cashier;
