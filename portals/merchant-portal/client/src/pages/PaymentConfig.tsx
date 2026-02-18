/**
 * 前言：此檔案為商戶端支付配置頁面，負責管理支付通道、回調地址、安全憑證及簽名規則說明。
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

const PaymentConfig: React.FC = () => {
  const { t } = useTranslation();
  const [showSecret, setShowSecret] = useState(false);
  const [apiKey] = useState('pk_demo_your_merchant_api_key_here');
  const [apiSecret] = useState('your_api_secret_here');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">支付配置</h1>
      </div>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">支付通道配置</TabsTrigger>
          <TabsTrigger value="callbacks">回調地址設定</TabsTrigger>
          <TabsTrigger value="credentials">安全憑證管理</TabsTrigger>
          <TabsTrigger value="signature">簽名規則說明</TabsTrigger>
        </TabsList>

        {/* 支付通道配置 */}
        <TabsContent value="channels" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>支付通道管理</CardTitle>
              <CardDescription>啟用或停用您的支付通道，並查看各通道費率。</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>通道名稱</TableHead>
                    <TableHead>支援幣種</TableHead>
                    <TableHead>費率</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: '支付寶 (Alipay)', currency: 'CNY', rate: '1.2%', status: true },
                    { name: '微信支付 (WeChat Pay)', currency: 'CNY', rate: '1.2%', status: true },
                    { name: 'USDT (TRC20)', currency: 'USDT', rate: '0.5%', status: true },
                    { name: '信用卡 (Visa/Master)', currency: 'USD, TWD', rate: '2.8%', status: false },
                  ].map((channel) => (
                    <TableRow key={channel.name}>
                      <TableCell className="font-medium">{channel.name}</TableCell>
                      <TableCell>{channel.currency}</TableCell>
                      <TableCell>{channel.rate}</TableCell>
                      <TableCell>
                        <Badge variant={channel.status ? "default" : "secondary"}>
                          {channel.status ? "已啟用" : "已停用"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch checked={channel.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 回調地址設定 */}
        <TabsContent value="callbacks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>回調地址設定</CardTitle>
              <CardDescription>設定支付成功與退款時的伺服器通知 URL。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pay-callback">支付成功回調 URL</Label>
                <div className="flex gap-2">
                  <Input id="pay-callback" placeholder="https://your-api.com/callback/payment" defaultValue="https://api.merchant.com/v1/pay-notify" />
                  <Button variant="outline">測試</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refund-callback">退款回調 URL</Label>
                <div className="flex gap-2">
                  <Input id="refund-callback" placeholder="https://your-api.com/callback/refund" defaultValue="https://api.merchant.com/v1/refund-notify" />
                  <Button variant="outline">測試</Button>
                </div>
              </div>
              <Button className="w-full md:w-auto">儲存設定</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全憑證管理 */}
        <TabsContent value="credentials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>安全憑證管理</CardTitle>
              <CardDescription>用於 API 請求身份驗證的憑證，請妥善保管 API Secret。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>API Key (商戶 ID)</Label>
                <div className="flex gap-2">
                  <Input value={apiKey} readOnly className="font-mono text-sm" />
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(apiKey, 'key')}>
                    {copied === 'key' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>API Secret</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showSecret ? "text" : "password"} 
                    value={apiSecret} 
                    readOnly 
                    className="font-mono text-sm" 
                  />
                  <Button variant="ghost" size="icon" onClick={() => setShowSecret(!showSecret)}>
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(apiSecret, 'secret')}>
                    {copied === 'secret' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button variant="destructive" className="flex gap-2">
                  <RefreshCw className="h-4 w-4" /> 重新生成 API Secret
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  警告：重新生成後，舊的 Secret 將立即失效，請確保您的系統已同步更新。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 簽名規則說明 */}
        <TabsContent value="signature" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>簽名規則說明</CardTitle>
              <CardDescription>所有 API 請求均需包含簽名以確保安全性。</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h3>1. 參數排序</h3>
              <p>將所有請求參數（不含簽名本身與空值參數）按照參數名 ASCII 碼從小到大排序（字典序）。</p>
              
              <h3>2. 拼接字串</h3>
              <p>將排序後的參數以 <code>key=value</code> 的格式用 <code>&</code> 符號拼接，最後加上 <code>&key=YOUR_API_SECRET</code>。</p>
              <pre className="bg-muted p-4 rounded-md">
                <code>stringToSign = "amount=100&currency=TWD&merchant_id=pk_123&order_id=ORD001&key=YOUR_API_SECRET"</code>
              </pre>

              <h3>3. 生成簽名</h3>
              <p>對拼接後的字串進行 MD5 運算，並將結果轉換為大寫。</p>
              <pre className="bg-muted p-4 rounded-md">
                <code>sign = MD5(stringToSign).toUpperCase()</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentConfig;
