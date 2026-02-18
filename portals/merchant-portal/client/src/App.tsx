/**
 * 聚合支付平台 - 商戶端前端應用
 * 主應用組件
 * 
 * 本組件定義應用的路由結構和全局配置
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Refunds from "./pages/Refunds";
import Settlements from "./pages/Settlements";
import NotFound from "@/pages/NotFound";
import i18n from "./i18n/config";

// 初始化 i18next
i18n;

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/orders" component={Orders} />
      <Route path="/refunds" component={Refunds} />
      <Route path="/settlements" component={Settlements} />
      <Route path="/payment-config" component={() => <div>Payment Config - Coming Soon</div>} />
      <Route path="/cashier" component={() => <div>Cashier - Coming Soon</div>} />
      <Route path="/settings" component={() => <div>Settings - Coming Soon</div>} />
      <Route path="/" component={() => <Login />} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
