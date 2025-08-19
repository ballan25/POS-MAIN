import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlertSystem = ({ alerts = [], onDismiss }) => {
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState([]);

  // Fetch real-time alerts from your system
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        
        // Replace with your actual API endpoint
        const response = await fetch('/api/alerts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const alertsData = await response.json();
          setSystemAlerts(alertsData);
        } else {
          console.error('Failed to fetch alerts');
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    // Set up real-time updates via WebSocket or polling
    const alertInterval = setInterval(fetchAlerts, 30000); // Poll every 30 seconds

    return () => clearInterval(alertInterval);
  }, []);

  // Combine props alerts with system alerts and sort by priority
  useEffect(() => {
    const allAlerts = [...alerts, ...systemAlerts];
    
    const sortedAlerts = allAlerts.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
    
    setVisibleAlerts(sortedAlerts.slice(0, 5)); // Show max 5 alerts
  }, [alerts, systemAlerts]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      case 'success':
        return 'CheckCircle';
      case 'inventory':
        return 'Package';
      case 'payment':
        return 'CreditCard';
      case 'system':
        return 'Settings';
      default:
        return 'Bell';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'inventory':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'payment':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'system':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / 60000);
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return format(date, 'MMM dd, HH:mm');
    } catch (error) {
      return 'Unknown time';
    }
  };

  const handleDismissAlert = async (alertId, event) => {
    event?.stopPropagation();
    
    try {
      // API call to mark alert as dismissed
      const response = await fetch(`/api/alerts/${alertId}/dismiss`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        onDismiss?.(alertId);
        setVisibleAlerts(current => current.filter(alert => alert.id !== alertId));
      } else {
        console.error('Failed to dismiss alert');
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const handleToggleExpanded = (alertId) => {
    setExpandedAlert(current => current === alertId ? null : alertId);
  };

  const handleDismissAll = async () => {
    if (window.confirm('Dismiss all alerts?')) {
      try {
        const response = await fetch('/api/alerts/dismiss-all', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          visibleAlerts.forEach(alert => onDismiss?.(alert.id));
          setVisibleAlerts([]);
        } else {
          console.error('Failed to dismiss all alerts');
        }
      } catch (error) {
        console.error('Error dismissing all alerts:', error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/alerts/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        alert('All alerts marked as read');
      } else {
        console.error('Failed to mark alerts as read');
      }
    } catch (error) {
      console.error('Error marking alerts as read:', error);
    }
  };

  const handleActionClick = async (alert, actionType) => {
    try {
      const response = await fetch(`/api/alerts/${alert.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ action: actionType, alertType: alert.type })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Action ${actionType} executed: ${result.message}`);
      } else {
        console.error('Failed to execute action');
      }
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Icon name="CheckCircle" size={20} className="text-green-600" />
          <span className="text-green-800 font-medium">No active alerts</span>
        </div>
        <p className="text-green-700 text-sm mt-1">All systems are running normally</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Bell" size={20} className="text-gray-900" />
          <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
          <div className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {visibleAlerts.length}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs"
          >
            <Icon name="CheckCheck" size={14} className="mr-1" />
            Mark All Read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissAll}
            className="text-xs text-red-600 hover:text-red-700"
          >
            <Icon name="X" size={14} className="mr-1" />
            Dismiss All
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {visibleAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md ${
              getAlertColor(alert.type)
            } ${expandedAlert === alert.id ? 'shadow-lg' : ''}`}
            onClick={() => handleToggleExpanded(alert.id)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Icon 
                    name={getAlertIcon(alert.type)} 
                    size={20} 
                    className="mt-0.5 flex-shrink-0" 
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold">
                        {alert.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                        {alert.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm leading-relaxed">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <Icon
                          name={expandedAlert === alert.id ? "ChevronUp" : "ChevronDown"}
                          size={14}
                          className="opacity-70"
                        />
                        <span className="text-xs opacity-70">
                          {expandedAlert === alert.id ? 'Less' : 'More'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDismissAlert(alert.id, e)}
                  className="ml-2 flex-shrink-0"
                  title="Dismiss alert"
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>

              {/* Expanded Content */}
              {expandedAlert === alert.id && (
                <div className="mt-4 pt-4 border-t border-current/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-2">Alert Details</h5>
                      <div className="space-y-1 opacity-80">
                        <div>Type: <span className="font-medium">{alert.type.toUpperCase()}</span></div>
                        <div>Priority: <span className="font-medium">{alert.priority.toUpperCase()}</span></div>
                        <div>Time: <span className="font-medium">{format(new Date(alert.timestamp), 'PPpp')}</span></div>
                        {alert.source && <div>Source: <span className="font-medium">{alert.source}</span></div>}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Quick Actions</h5>
                      <div className="space-y-2">
                        {alert.type === 'inventory' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(alert, 'restock');
                              }}
                              className="w-full justify-start"
                            >
                              <Icon name="Package" size={14} className="mr-2" />
                              Restock Item
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(alert, 'auto_reorder');
                              }}
                              className="w-full justify-start"
                            >
                              <Icon name="RefreshCw" size={14} className="mr-2" />
                              Auto Reorder
                            </Button>
                          </>
                        )}
                        
                        {alert.type === 'payment' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(alert, 'retry_payment');
                            }}
                            className="w-full justify-start"
                          >
                            <Icon name="CreditCard" size={14} className="mr-2" />
                            Retry Payment
                          </Button>
                        )}
                        
                        {alert.type === 'system' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(alert, 'system_check');
                            }}
                            className="w-full justify-start"
                          >
                            <Icon name="Settings" size={14} className="mr-2" />
                            Run Diagnostics
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(alert, 'snooze');
                          }}
                          className="w-full justify-start"
                        >
                          <Icon name="Clock" size={14} className="mr-2" />
                          Snooze 1 Hour
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {systemAlerts.length > visibleAlerts.length && (
        <div className="mt-3 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisibleAlerts(systemAlerts.slice(0, systemAlerts.length))}
          >
            Show {systemAlerts.length - visibleAlerts.length} More Alert{systemAlerts.length - visibleAlerts.length > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;