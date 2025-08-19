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
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [firestoreStatus, setFirestoreStatus] = useState('connected');
  const [mpesaApiStatus, setMpesaApiStatus] = useState('connected');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  
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

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      const [kpiResponse, transactionsResponse, alertsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard/kpi?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`),
        fetch(`${API_BASE_URL}/admin/transactions/recent?limit=10`),
        fetch(`${API_BASE_URL}/admin/alerts/active`)
      ]);

      if (!kpiResponse.ok || !transactionsResponse.ok || !alertsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const kpiData = await kpiResponse.json();
      const transactionsData = await transactionsResponse.json();
      const alertsData = await alertsResponse.json();

      setDashboardData({
        kpi: kpiData,
        recentTransactions: transactionsData.transactions || []
      });

      setAlerts(alertsData.alerts || []);
      setLastUpdated(new Date());
      setError(null);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Fallback to mock data if API fails
      setDashboardData({
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
          }
        ]
      });
    }
  }, [dateRange, API_BASE_URL]);

  // WebSocket connection for real-time updates
  const setupWebSocket = useCallback(() => {
    if (!user) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
    wsRef.current = new WebSocket(`${wsUrl}/admin-dashboard`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setFirestoreStatus('connected');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'NEW_TRANSACTION':
            setDashboardData(prev => ({
              ...prev,
              recentTransactions: [data.transaction, ...prev.recentTransactions.slice(0, 9)]
            }));
            break;
            
          case 'KPI_UPDATE':
            setDashboardData(prev => ({
              ...prev,
              kpi: { ...prev.kpi, ...data.kpi }
            }));
            break;
            
          case 'ALERT':
            setAlerts(prev => [data.alert, ...prev]);
            break;
            
          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
        
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setFirestoreStatus('disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(setupWebSocket, 5000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setFirestoreStatus('error');
    };

  }, [user]);

  // Polling fallback for real-time updates
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Poll every 30 seconds
  }, [fetchDashboardData]);

  // Initialize user and data
  useEffect(() => {
    try {
      // Check for authenticated user (implement your auth logic here)
      const mockUser = {
        id: 'admin_001',
        name: 'Admin Manager',
        email: 'admin@bobacafe.com',
        role: 'admin',
        portal: 'admin'
      };
      setUser(mockUser);

    } catch (err) {
      console.error('Error initializing:', err);
      setError('Failed to initialize dashboard');
    }
  }, []);

  // Fetch initial data when user is set
  useEffect(() => {
    if (user) {
      fetchDashboardData().finally(() => setIsLoading(false));
    }
  }, [user, fetchDashboardData]);

  // Setup real-time connections
  useEffect(() => {
    if (user && dashboardData) {
      setupWebSocket();
      startPolling();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user, dashboardData, setupWebSocket, startPolling]);

  // Check system status
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/system/status`);
        if (response.ok) {
          const status = await response.json();
          setFirestoreStatus(status.firestore || 'connected');
          setMpesaApiStatus(status.mpesa || 'connected');
        }
      } catch (err) {
        console.error('Error checking system status:', err);
      }
    };

    const statusInterval = setInterval(checkSystemStatus, 60000); // Check every minute
    checkSystemStatus(); // Initial check

    return () => clearInterval(statusInterval);
  }, [API_BASE_URL]);

  const handleLogout = () => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      setUser(null);
      navigate('/staff-login-and-authentication', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/staff-login-and-authentication';
    }
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    fetchDashboardData().finally(() => setIsLoading(false));
  };

  const handleExportData = async (format) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/export/dashboard?format=${format}&startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    }
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
  if (error && !dashboardData) {
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
            {error && (
              <div className="text-yellow-600 text-sm">
                <Icon name="AlertTriangle" className="mr-1" />
                Data may be outdated
              </div>
            )}
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
              <Button 
                variant="outline" 
                onClick={handleRefreshData}
                disabled={isLoading}
              >
                <Icon name={isLoading ? "Loader" : "RefreshCw"} /> 
                {isLoading ? "Loading..." : "Refresh"}
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
        {dashboardData && (
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
              <p className={`text-sm mt-2 ${dashboardData.kpi.dailyRevenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.kpi.dailyRevenueChange >= 0 ? '+' : ''}{dashboardData.kpi.dailyRevenueChange}% from yesterday
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
              <p className={`text-sm mt-2 ${dashboardData.kpi.transactionCountChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.kpi.transactionCountChange >= 0 ? '+' : ''}{dashboardData.kpi.transactionCountChange}% from yesterday
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
              <p className={`text-sm mt-2 ${dashboardData.kpi.averageOrderValueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.kpi.averageOrderValueChange >= 0 ? '+' : ''}{dashboardData.kpi.averageOrderValueChange}% from yesterday
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
              <p className={`text-sm mt-2 ${dashboardData.kpi.mpesaRatioChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.kpi.mpesaRatioChange >= 0 ? '+' : ''}{dashboardData.kpi.mpesaRatioChange}% from yesterday
              </p>
            </div>
          </div>
        )}

        {/* Transaction Feed */}
        {dashboardData && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Icon name="Activity" className="mr-2" />
                  Live Transaction Feed
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${firestoreStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {firestoreStatus === 'connected' ? 'Live updates' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentTransactions.length > 0 ? (
                  dashboardData.recentTransactions.map(transaction => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="Inbox" size={48} className="mb-2" />
                    <p>No recent transactions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Integration Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Firestore Database</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${firestoreStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm ${firestoreStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                    {firestoreStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">M-Pesa API</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${mpesaApiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm ${mpesaApiStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                    {mpesaApiStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => handleExportData('csv')}>
                <Icon name="Download" className="mr-2" />
                Generate Sales Report
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleRefreshData}>
                <Icon name="RefreshCw" className="mr-2" />
                Sync Data
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/transactions')}>
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
              <Button className="w-full" onClick={() => handleExportData('csv')}>Export as CSV</Button>
              <Button variant="outline" className="w-full" onClick={() => handleExportData('pdf')}>Export as PDF</Button>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSalesDashboardAndAnalytics;
