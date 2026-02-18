/**
 * 前言：此檔案為商戶端文檔中心頁面，包含 API 對接文件、簽名規則、錯誤碼列表及各語言接入範例。
 * 支援文件下載為 PDF。使用 React + TypeScript + shadcn/ui 實作。
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Code, 
  AlertCircle, 
  Key, 
  BookOpen,
  Terminal
} from "lucide-react";
import { useTranslation } from 'react-i18next';

const DocCenter: React.FC = () => {
  const { t } = useTranslation();

  const handleDownloadPDF = () => {
    // 模擬下載 PDF 功能
    alert('正在生成 PDF 文件，請稍候...');
  };

  const codeExamples = {
    javascript: `const crypto = require('crypto');

function generateSign(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys
    .filter(key => params[key] !== '' && key !== 'sign')
    .map(key => \`\${key}=\${params[key]}\`)
    .join('&') + '&key=' + secret;
  
  return crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase();
}`,
    python: `import hashlib

def generate_sign(params, secret):
    sorted_keys = sorted(params.keys())
    string_to_sign = "&".join([f"{k}={params[k]}" for k in sorted_keys if params[k] != "" and k != "sign"])
    string_to_sign += f"&key={secret}"
    
    return hashlib.md5(string_to_sign.encode('utf-8')).hexdigest().upper()`,
    php: `function generateSign($params, $secret) {
    ksort($params);
    $stringToSign = "";
    foreach ($params as $key => $val) {
        if ($val != "" && $key != "sign") {
            $stringToSign .= $key . "=" . $val . "&";
        }
    }
    $stringToSign .= "key=" . $secret;
    return strtoupper(md5($stringToSign));
}`,
    java: `public String generateSign(Map<String, String> params, String secret) {
    TreeMap<String, String> sortedParams = new TreeMap<>(params);
    StringBuilder sb = new StringBuilder();
    for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
        if (!entry.getValue().isEmpty() && !entry.getKey().equals("sign")) {
            sb.append(entry.getKey()).append("=").append(entry.getValue()).append("&");
        }
    }
    sb.append("key=").append(secret);
    return DigestUtils.md5Hex(sb.toString()).toUpperCase();
}`
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">文檔中心</h1>
          <p className="text-muted-foreground">獲取 API 對接指南、開發範例與技術支援。</p>
        </div>
        <Button onClick={handleDownloadPDF} className="flex gap-2">
          <Download className="h-4 w-4" /> 下載完整 PDF 文件
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左側導航 */}
        <div className="lg:col-span-1 space-y-2">
          <Card className="p-2">
            <nav className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-2 font-medium bg-muted">
                <BookOpen className="h-4 w-4" /> 快速開始
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Key className="h-4 w-4" /> 簽名規則
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Terminal className="h-4 w-4" /> API 參考
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <AlertCircle className="h-4 w-4" /> 錯誤碼列表
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Code className="h-4 w-4" /> 接入範例
              </Button>
            </nav>
          </Card>
        </div>

        {/* 右側內容 */}
        <div className="lg:col-span-3 space-y-8">
          {/* API 對接文件 */}
          <section id="api-reference" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Terminal className="h-6 w-6 text-primary" /> API 對接文件
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>支付下單 (Create Order)</CardTitle>
                <CardDescription>商戶系統發起支付請求，獲取支付連結或 QR 碼。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">POST</Badge>
                  <code className="text-sm font-mono">/api/v1/payments</code>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>參數名</TableHead>
                      <TableHead>類型</TableHead>
                      <TableHead>必填</TableHead>
                      <TableHead>說明</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">merchant_id</TableCell>
                      <TableCell>String</TableCell>
                      <TableCell>是</TableCell>
                      <TableCell>商戶唯一識別碼 (API Key)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">order_id</TableCell>
                      <TableCell>String</TableCell>
                      <TableCell>是</TableCell>
                      <TableCell>商戶系統訂單號</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">amount</TableCell>
                      <TableCell>Decimal</TableCell>
                      <TableCell>是</TableCell>
                      <TableCell>訂單金額，保留兩位小數</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">sign</TableCell>
                      <TableCell>String</TableCell>
                      <TableCell>是</TableCell>
                      <TableCell>請求簽名</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* 簽名規則 */}
          <section id="signature-rules" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Key className="h-6 w-6 text-primary" /> 簽名規則說明
            </h2>
            <Card>
              <CardContent className="pt-6 prose prose-sm max-w-none dark:prose-invert">
                <p>為了保證交易安全，所有 API 請求都必須攜帶簽名。簽名生成的步驟如下：</p>
                <ol>
                  <li><strong>篩選與排序：</strong> 獲取所有請求參數，剔除 <code>sign</code> 參數及參數值為空的參數，按參數名 ASCII 碼從小到大排序。</li>
                  <li><strong>拼接：</strong> 將排序後的參數以 <code>key=value</code> 的格式用 <code>&</code> 符號拼接成字串。</li>
                  <li><strong>加鹽：</strong> 在拼接字串最後加上 <code>&key=YOUR_API_SECRET</code>。</li>
                  <li><strong>加密：</strong> 對字串進行 MD5 加密，並將結果轉換為大寫。</li>
                </ol>
              </CardContent>
            </Card>
          </section>

          {/* 接入範例 */}
          <section id="code-examples" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" /> 各語言接入範例
            </h2>
            <Tabs defaultValue="javascript">
              <TabsList>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="php">PHP</TabsTrigger>
                <TabsTrigger value="java">Java</TabsTrigger>
              </TabsList>
              {Object.entries(codeExamples).map(([lang, code]) => (
                <TabsContent key={lang} value={lang}>
                  <Card>
                    <CardContent className="pt-6">
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">
                        <code>{code}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </section>

          {/* 錯誤碼列表 */}
          <section id="error-codes" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary" /> 錯誤碼列表
            </h2>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>錯誤碼</TableHead>
                      <TableHead>說明</TableHead>
                      <TableHead>建議處理方式</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">200</TableCell>
                      <TableCell>成功</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">4001</TableCell>
                      <TableCell>簽名錯誤</TableCell>
                      <TableCell>檢查簽名算法與 API Secret 是否正確</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">4002</TableCell>
                      <TableCell>參數缺失</TableCell>
                      <TableCell>檢查必填參數是否已傳送</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">5001</TableCell>
                      <TableCell>通道維護中</TableCell>
                      <TableCell>請嘗試切換其他支付通道</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocCenter;
