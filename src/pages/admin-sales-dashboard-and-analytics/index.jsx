import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSalesDashboardAndAnalytics = () => {
  const navigate = useNavigate();
  
  // State Management
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [selectedCashiers, setSelectedCashiers] = useState([]);
  const [selectedChartView, setSelectedChartView] = useState('daily');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [firestoreStatus, setFirestoreStatus] = useState('connected');
  const [mpesaApiStatus, setMpesaApiStatus] = useState('connected');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Simple Icon component
  const Icon = ({ name, size = 16, className = "" }) => {
    const icons = {
      Activity: "📊", Shield: "🛡️", AlertTriangle: "⚠️", Download: "⬇️",
      RefreshCw: "🔄", Play: "▶️", Pause: "⏸️", Eye: "👁️", Receipt: "🧾",
      CheckCircle: "✅", Clock: "🕐", XCircle: "❌", Circle: "⚪",
      Smartphone: "📱", Banknote: "💵", CreditCard: "💳", Inbox: "📥",
      ChevronDown: "⬇️", Loader: "⏳"
    };
    
    return (
      <span 
        className={`inline-block ${className}`} 
        style={{ fontSize: `${size}px` }}
      >
        {icons[name] || "❓"}
      </span>
    );
  };

  // Simple Button component
  const Button = ({ 
    children, 
    onClick, 
    variant = "default", 
    size = "md", 
    disabled = false,
    iconName,
    iconPosition = "left",
    className = ""
  }) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors";
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
      ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {iconName && iconPosition === "left" && <Icon name={iconName} className="mr-2" />}
        {children}
        {iconName && iconPosition === "right" && <Icon name={iconName} className="ml-2" />}
      </button>
    );
  };

  // Initialize user and mock data
  useEffect(() => {
    try {
      // Set mock admin user
      const mockUser = {
        id: 'admin_001',
        name: 'Admin Manager',
        email: 'admin@bobacafe.com',
        role: 'admin',
        portal: 'admin' // Explicitly set portal type
      };
      setUser(mockUser);

      // Set mock dashboard data
      const mockData = {
        kpi: {
          dailyRevenue: 45250.75,
          dailyRevenueChange: 12.5,
          transactionCount: 187,
          transactionCountChange: -3.2,
          averageOrderValue: 242.25,
          averageOrderValueChange: 8.1,
          mpesaRatio: 68.5,
          mpesaRatioChange: 5.2,
          cashRatio: 31.5
        },
        recentTransactions: [
          {
            id: 'TXN001',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            amount: 450,
            method: 'M-Pesa',
            cashier: 'Sarah Johnson',
            items: ['Classic Milk Tea (L)', 'Tapioca Pearls'],
            status: 'completed'
          },
          {
            id: 'TXN002',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            amount: 320,
            method: 'Cash',
            cashier: 'Mike Chen',
            items: ['Taro Smoothie (M)'],
            status: 'completed'
          }
        ]
      };
      
      setDashboardData(mockData);
      setIsLoading(false);

      // Set mock alerts
      setAlerts([
        {
          id: 'alert_001',
          type: 'warning',
          title: 'Inventory Low',
          message: 'Tapioca pearls running low (12 units remaining)',
          timestamp: new Date().toISOString(),
          priority: 'medium'
        }
      ]);

    } catch (err) {
      console.error('Error initializing:', err);
      setError('Failed to initialize dashboard');
    }
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!user || !dashboardData) return;

    const interval = setInterval(() => {
      // Update KPI values slightly
      setDashboardData(prev => ({
        ...prev,
        kpi: {
          ...prev.kpi,
          dailyRevenue: prev.kpi.dailyRevenue + (Math.random() * 100 - 50),
          transactionCount: prev.kpi.transactionCount + Math.floor(Math.random() * 3)
        }
      }));
      
      setLastUpdated(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [user, dashboardData]);

  const handleLogout = () => {
    try {
      setUser(null);
      navigate('/staff-login-and-authentication', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/staff-login-and-authentication';
    }
  };

  const handleRefreshData = () => {
    setLastUpdated(new Date());
    // Simulate data refresh
    setDashboardData(prev => ({
      ...prev,
      kpi: {
        ...prev.kpi,
        dailyRevenue: prev.kpi.dailyRevenue + (Math.random() * 200 - 100)
      }
    }));
  };

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={32} className="animate-pulse mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Access control - ONLY allow admin users
  if (user.role !== 'admin' && user.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon name="Shield" size={48} className="mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            This is the ADMIN portal. Only administrators and managers can access this dashboard.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Current role: {user.role}
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/point-of-sale-order-processing')}>
              Go to Cashier Portal
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon name="AlertTriangle" size={48} className="mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Icon name="Activity" size={24} className="text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">ADMIN PORTAL</h1>
              <p className="text-sm text-gray-500">Sales Dashboard & Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role.toUpperCase()}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sales Dashboard & Analytics
              </h2>
              <p className="text-gray-600">
                Real-time business intelligence and operational insights
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleRefreshData}>
                <Icon name="RefreshCw" /> Refresh
              </Button>
              <Button onClick={() => setShowExportModal(true)}>
                <Icon name="Download" /> Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                <div className="flex items-center">
                  <Icon name="AlertTriangle" className="text-yellow-600 mr-3" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800">{alert.title}</h4>
                    <p className="text-sm text-yellow-700">{alert.message}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {dashboardData.kpi.dailyRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-green-600">
                <Icon name="CheckCircle" size={24} />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              +{dashboardData.kpi.dailyRevenueChange}% from yesterday
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.kpi.transactionCount}</p>
              </div>
              <div className="text-blue-600">
                <Icon name="Activity" size={24} />
              </div>
            </div>
            <p className="text-sm text-red-600 mt-2">
              {dashboardData.kpi.transactionCountChange}% from yesterday
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {dashboardData.kpi.averageOrderValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-purple-600">
                <Icon name="CreditCard" size={24} />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              +{dashboardData.kpi.averageOrderValueChange}% from yesterday
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">M-Pesa Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.kpi.mpesaRatio}%</p>
              </div>
              <div className="text-green-600">
                <Icon name="Smartphone" size={24} />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              +{dashboardData.kpi.mpesaRatioChange}% from yesterday
            </p>
          </div>
        </div>

        {/* Transaction Feed */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="Activity" className="mr-2" />
                Live Transaction Feed
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-gray-500">Live updates</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon name={transaction.method === 'M-Pesa' ? 'Smartphone' : 'Banknote'} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.id}</p>
                      <p className="text-sm text-gray-600">{transaction.cashier} • {transaction.method}</p>
                      <p className="text-xs text-gray-500">{transaction.items.join(', ')}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      KES {transaction.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Icon name="CheckCircle" className="text-green-600" size={14} />
                      <span className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Integration Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Firestore Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">M-Pesa API</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Icon name="Download" className="mr-2" />
                Generate Sales Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Icon name="RefreshCw" className="mr-2" />
                Sync Data
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Icon name="Eye" className="mr-2" />
                View All Transactions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Export Data</h3>
            <p className="text-gray-600 mb-4">Choose your export format and data range.</p>
            <div className="space-y-4">
              <Button className="w-full">Export as CSV</Button>
              <Button variant="outline" className="w-full">Export as PDF</Button>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                alert('Export started!');
                setShowExportModal(false);
              }}>
                Export
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSalesDashboardAndAnalytics;