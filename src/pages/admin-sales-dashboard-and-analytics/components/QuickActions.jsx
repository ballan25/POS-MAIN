import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ 
  onExport, 
  onRefresh, 
  user,
  apiEndpoint = '/api/dashboard/status',
  refreshInterval = 120000, // 2 minutes in milliseconds
  onError = (error) => console.error('Error fetching dashboard status:', error)
}) => {
  const navigate = useNavigate();
  
  const [systemStatus, setSystemStatus] = useState({
    lastSync: null,
    dataStatus: 'loading',
    storageUsed: 0,
    storageTotal: 5,
    isOnline: true
  });
  
  const [dailyTarget, setDailyTarget] = useState({
    current: 0,
    target: 50000,
    percentage: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real-time dashboard status
  const fetchDashboardStatus = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update system status
      if (result.systemStatus) {
        setSystemStatus({
          lastSync: new Date(result.systemStatus.lastSync || Date.now()),
          dataStatus: result.systemStatus.dataStatus || 'real-time',
          storageUsed: parseFloat(result.systemStatus.storageUsed) || 0,
          storageTotal: parseFloat(result.systemStatus.storageTotal) || 5,
          isOnline: result.systemStatus.isOnline !== false
        });
      }
      
      // Update daily target
      if (result.dailyTarget) {
        const current = parseFloat(result.dailyTarget.current) || 0;
        const target = parseFloat(result.dailyTarget.target) || 50000;
        setDailyTarget({
          current,
          target,
          percentage: target > 0 ? Math.min((current / target) * 100, 100) : 0
        });
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      onError(err);
    }
  }, [apiEndpoint, onError]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardStatus();
  }, [fetchDashboardStatus]);

  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchDashboardStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDashboardStatus, refreshInterval]);

  // Enhanced refresh function that updates both component and parent data
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await fetchDashboardStatus();
    
    // Also trigger parent refresh if provided
    if (onRefresh) {
      onRefresh();
    }
  }, [fetchDashboardStatus, onRefresh]);

  // Enhanced export function with real-time data
  const handleExport = useCallback(async () => {
    if (onExport) {
      // Pass current system status to export function
      onExport({
        systemStatus,
        dailyTarget,
        timestamp: new Date().toISOString()
      });
    }
  }, [onExport, systemStatus, dailyTarget]);

  const actions = [
    {
      id: 'export',
      label: 'Export Data',
      icon: 'Download',
      variant: 'default',
      onClick: handleExport,
      description: 'Export dashboard data to CSV/PDF'
    },
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: 'RefreshCw',
      variant: 'outline',
      onClick: handleRefresh,
      description: 'Reload all dashboard data',
      loading: loading
    },
    {
      id: 'pos',
      label: 'Go to POS',
      icon: 'ShoppingCart',
      variant: 'outline',
      onClick: () => navigate('/point-of-sale-order-processing'),
      description: 'Switch to POS system'
    },
    {
      id: 'receipts',
      label: 'Receipt Manager',
      icon: 'Receipt',
      variant: 'outline',
      onClick: () => navigate('/receipt-generation-and-management'),
      description: 'Manage receipt templates and printing'
    },
    {
      id: 'backup',
      label: 'Backup Data',
      icon: 'Database',
      variant: 'outline',
      onClick: async () => {
        try {
          const response = await fetch('/api/backup/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            alert('Backup created successfully!');
          } else {
            throw new Error('Backup failed');
          }
        } catch (err) {
          alert('Backup failed: ' + err.message);
        }
      },
      description: 'Create data backup',
      managerOnly: true
    },
    {
      id: 'settings',
      label: 'Dashboard Settings',
      icon: 'Settings',
      variant: 'ghost',
      onClick: () => navigate('/dashboard/settings'),
      description: 'Configure dashboard preferences'
    }
  ];

  const visibleActions = actions?.filter(action => 
    !action?.managerOnly || user?.role === 'manager'
  );

  const handleKeyboardShortcut = (action) => {
    const shortcuts = {
      'export': 'Ctrl+E',
      'refresh': 'F5',
      'pos': 'Ctrl+P',
      'receipts': 'Ctrl+R'
    };
    
    return shortcuts?.[action?.id] || null;
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Get status color and icon
  const getDataStatusInfo = (status) => {
    switch (status) {
      case 'real-time':
        return { color: 'text-success', icon: 'CheckCircle', dot: 'bg-success' };
      case 'syncing':
        return { color: 'text-warning', icon: 'Clock', dot: 'bg-warning' };
      case 'offline':
        return { color: 'text-error', icon: 'WifiOff', dot: 'bg-error' };
      default:
        return { color: 'text-muted-foreground', icon: 'HelpCircle', dot: 'bg-muted' };
    }
  };

  const statusInfo = getDataStatusInfo(systemStatus.dataStatus);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Zap" size={20} className="mr-2" />
          Quick Actions
          {loading && (
            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </h3>
        <div className="text-xs text-muted-foreground">
          Keyboard shortcuts available
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md">
          <p className="text-sm text-error">Status update failed: {error}</p>
        </div>
      )}

      <div className="space-y-3">
        {visibleActions?.map((action) => {
          const shortcut = handleKeyboardShortcut(action);
          
          return (
            <div key={action?.id} className="group relative">
              <Button
                variant={action?.variant}
                size="sm"
                onClick={action?.onClick}
                iconName={action?.loading ? 'Loader2' : action?.icon}
                iconPosition="left"
                iconSize={16}
                className={`w-full justify-start touch-feedback group-hover:scale-[1.02] transition-transform ${
                  action?.loading ? 'animate-spin' : ''
                }`}
                disabled={action?.loading}
              >
                <div className="flex-1 text-left">
                  <div className="font-medium">{action?.label}</div>
                  {shortcut && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {shortcut}
                    </div>
                  )}
                </div>
              </Button>
              
              {/* Tooltip */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 bg-popover border border-border rounded-md px-3 py-2 text-xs text-popover-foreground shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 whitespace-nowrap">
                {action?.description}
                {shortcut && (
                  <div className="text-muted-foreground mt-1">
                    Press {shortcut}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">System Status</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Sync:</span>
            <div className="flex items-center space-x-1">
              <Icon 
                name={systemStatus.isOnline ? "CheckCircle" : "AlertCircle"} 
                size={12} 
                className={systemStatus.isOnline ? "text-success" : "text-error"} 
              />
              <span className="text-foreground">
                {formatTimeAgo(systemStatus.lastSync)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Data Status:</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 ${statusInfo.dot} rounded-full ${
                systemStatus.dataStatus === 'real-time' ? 'animate-pulse' : ''
              }`} />
              <span className={`${statusInfo.color} capitalize`}>
                {systemStatus.dataStatus}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Storage:</span>
            <span className="text-foreground">
              {systemStatus.storageUsed.toFixed(1)}GB / {systemStatus.storageTotal}GB
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Connection:</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 ${systemStatus.isOnline ? 'bg-success' : 'bg-error'} rounded-full`} />
              <span className="text-foreground">
                {systemStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Target Progress */}
      <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon name="Target" size={14} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Daily Target</span>
          </div>
          <span className="text-xs text-primary font-medium">
            {dailyTarget.percentage.toFixed(0)}%
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(dailyTarget.percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            KES {dailyTarget.current.toLocaleString('en-KE')} / KES {dailyTarget.target.toLocaleString('en-KE')}
          </span>
          <span className={`font-medium ${
            dailyTarget.percentage >= 100 ? 'text-success' : 
            dailyTarget.percentage >= 80 ? 'text-warning' : 'text-muted-foreground'
          }`}>
            {dailyTarget.percentage >= 100 ? '🎯 Target reached!' : 
             `KES ${(dailyTarget.target - dailyTarget.current).toLocaleString('en-KE')} to go`}
          </span>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      {refreshInterval > 0 && (
        <div className="mt-3 text-xs text-muted-foreground text-center">
          Auto-refreshes every {Math.floor(refreshInterval / 60000)} minutes
        </div>
      )}
    </div>
  );
};

export default QuickActions;