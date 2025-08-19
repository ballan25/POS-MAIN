import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import NotFound from "./pages/NotFound.jsx";

// Import all page components
import ReceiptGenerationAndManagement from './pages/receipt-generation-and-management/index.jsx';
import StaffLoginAndAuthentication from './pages/staff-login-and-authentication/index.jsx';
import PaymentProcessingAndCheckout from './pages/payment-processing-and-checkout/index.jsx';
import PointOfSaleOrderProcessing from './pages/point-of-sale-order-processing/index.jsx';
import AdminSalesDashboardAndAnalytics from './pages/admin-sales-dashboard-and-analytics/index.jsx';

// Create placeholder components for missing pages
const Dashboard = () => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a href="/" className="block w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors text-center">
              Point of Sale
            </a>
            <a href="/staff-login-and-authentication" className="block w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/90 transition-colors text-center">
              Staff Login
            </a>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Today's Sales</h2>
          <p className="text-2xl font-bold text-primary">KES 0.00</p>
          <p className="text-sm text-muted-foreground">0 transactions</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">M-Pesa Connected</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Database Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const InventoryManagement = () => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Inventory Management</h1>
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground mb-4">Manage your inventory, track stock levels, and update product information.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2">Low Stock Alerts</h3>
            <p className="text-sm text-muted-foreground">No low stock items currently</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2">Recent Updates</h3>
            <p className="text-sm text-muted-foreground">No recent inventory updates</p>
          </div>
        </div>
        <div className="mt-6">
          <a href="/" className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
            Back to POS
          </a>
        </div>
      </div>
    </div>
  </div>
);

const ReportsAndAnalytics = () => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Reports & Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Sales Reports</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Daily Sales:</span>
              <span className="font-semibold">KES 0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Weekly Sales:</span>
              <span className="font-semibold">KES 0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Sales:</span>
              <span className="font-semibold">KES 0.00</span>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Popular Items</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Taro Milk Tea</span>
              <span className="text-sm font-semibold">0 sold</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tiger Milk Tea</span>
              <span className="text-sm font-semibold">0 sold</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Vanilla Milkshake</span>
              <span className="text-sm font-semibold">0 sold</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <a href="/" className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
          Back to POS
        </a>
      </div>
    </div>
  </div>
);

const CustomerManagement = () => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Customer Management</h1>
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground mb-6">Manage customer profiles, loyalty programs, and customer preferences.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-border rounded-lg p-4 text-center">
            <h3 className="font-semibold text-foreground mb-2">Total Customers</h3>
            <p className="text-2xl font-bold text-primary">0</p>
          </div>
          <div className="border border-border rounded-lg p-4 text-center">
            <h3 className="font-semibold text-foreground mb-2">Loyalty Members</h3>
            <p className="text-2xl font-bold text-primary">0</p>
          </div>
          <div className="border border-border rounded-lg p-4 text-center">
            <h3 className="font-semibold text-foreground mb-2">New This Month</h3>
            <p className="text-2xl font-bold text-primary">0</p>
          </div>
        </div>
        <div className="mt-6">
          <a href="/" className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
            Back to POS
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Settings = () => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">System Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Tax Rate</span>
              <span className="font-semibold">16%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Currency</span>
              <span className="font-semibold">KES</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Receipt Printer</span>
              <span className="font-semibold">Connected</span>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>M-Pesa Integration</span>
              <span className="text-green-600 font-semibold">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cash Payments</span>
              <span className="text-green-600 font-semibold">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Split Payments</span>
              <span className="text-green-600 font-semibold">Enabled</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <a href="/" className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
            Back to POS
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Main POS Route - Default */}
          <Route path="/" element={<PointOfSaleOrderProcessing />} />
          <Route path="/point-of-sale-order-processing" element={<PointOfSaleOrderProcessing />} />
          
          {/* Existing page routes */}
          <Route path="/receipt-generation-and-management" element={<ReceiptGenerationAndManagement />} />
          <Route path="/staff-login-and-authentication" element={<StaffLoginAndAuthentication />} />
          <Route path="/payment-processing-and-checkout" element={<PaymentProcessingAndCheckout />} />
          <Route path="/admin-sales-dashboard-and-analytics" element={<AdminSalesDashboardAndAnalytics />} />
          
          {/* Additional placeholder routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory-management" element={<InventoryManagement />} />
          <Route path="/reports-and-analytics" element={<ReportsAndAnalytics />} />
          <Route path="/customer-management" element={<CustomerManagement />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* 404 Not Found route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
