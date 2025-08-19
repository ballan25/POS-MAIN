import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const IntegrationStatus = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [integrationData, setIntegrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-refresh interval (30 seconds)
  useEffect(() => {
    fetchIntegrationStatus();
    
    const interval = setInterval(() => {
      fetchIntegrationStatus();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      setError(null);
      const response = await fetch('/api/integrations/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the API response to match our component structure
      const transformedData = [
        {
          name: 'Firestore Database',
          status: data.firestore?.status || 'error',
          description: 'Real-time data synchronization',
          lastActivity: formatTimestamp(new Date(data.firestore?.lastSync)),
          details: {
            'Connection': data.firestore?.connection || 'Unknown',
            'Latency': data.firestore?.latency || 'N/A',
            'Sync Rate': data.firestore?.syncRate || 'N/A',
            'Last Error': data.firestore?.lastError || 'None'
          }
        },
        {
          name: 'M-Pesa API',
          status: data.mpesa?.status || 'error',
          description: 'Payment processing service',
          lastActivity: formatTimestamp(new Date(data.mpesa?.lastActivity)),
          details: {
            'Status': data.mpesa?.serviceStatus || 'Unknown',
            'Success Rate': data.mpesa?.successRate || 'N/A',
            'Avg Response': data.mpesa?.avgResponseTime || 'N/A',
            'Last Transaction': data.mpesa?.lastTransaction || 'N/A'
          }
        }
      ];

      setIntegrationData(transformedData);
    } catch (err) {
      console.error('Error fetching integration status:', err);
      setError(err.message);
      
      // Fallback to mock data if API fails
      setIntegrationData([
        {
          name: 'Firestore Database',
          status: 'error',
          description: 'Real-time data synchronization',
          lastActivity: 'Connection failed',
          details: {
            'Connection': 'Failed',
            'Latency': 'N/A',
            'Sync Rate': 'N/A',
            'Last Error': 'Unable to connect'
          }
        },
        {
          name: 'M-Pesa API',
          status: 'error',
          description: 'Payment processing service',
          lastActivity: 'Connection failed',
          details: {
            'Status': 'Offline',
            'Success Rate': 'N/A',
            'Avg Response': 'N/A',
            'Last Transaction': 'N/A'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (date) => {
    if (!date || isNaN(date.getTime())) {
      return 'Never';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleRefreshStatus = async () => {
    setLoading(true);
    await fetchIntegrationStatus();
  };

  // Calculate overall status
  const getOverallStatus = () => {
    if (loading) return 'warning';
    if (error) return 'error';
    
    const statuses = integrationData.map(item => item.status);
    if (statuses.every(status => status === 'connected')) return 'connected';
    if (statuses.some(status => status === 'error')) return 'error';
    return 'warning';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className={`touch-feedback ${getStatusColor(overallStatus)}`}
      >
        <div className="flex items-center space-x-2">
          <Icon name={getStatusIcon(overallStatus)} size={16} />
          <span>Integrations</span>
          <div className={`w-2 h-2 rounded-full ${
            overallStatus === 'connected' ? 'bg-success animate-pulse' : 
            overallStatus === 'error' ? 'bg-error' : 'bg-warning'
          }`} />
        </div>
      </Button>

      {/* Status Dropdown */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevation-3 z-50 animate-slide-up">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Integration Status</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshStatus}
                  iconName="RefreshCw"
                  iconSize={14}
                  className={`touch-feedback ${loading ? 'animate-spin' : ''}`}
                  title="Refresh status"
                  disabled={loading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  iconName="X"
                  iconSize={14}
                  className="touch-feedback"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-error/10 border border-error/20 rounded text-xs text-error">
                Connection error: {error}
              </div>
            )}

            <div className="space-y-4">
              {loading ? (
                // Loading skeleton
                [...Array(2)].map((_, index) => (
                  <div key={index} className="border border-border rounded-md p-3 animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-muted rounded-full" />
                        <div>
                          <div className="w-24 h-3 bg-muted rounded mb-1" />
                          <div className="w-32 h-2 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="w-16 h-3 bg-muted rounded" />
                    </div>
                    <div className="w-20 h-2 bg-muted rounded mb-3" />
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="w-12 h-2 bg-muted rounded" />
                          <div className="w-8 h-2 bg-muted rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                integrationData?.map((integration) => (
                  <div key={integration?.name} className="border border-border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={getStatusIcon(integration?.status)} 
                          size={16} 
                          className={getStatusColor(integration?.status)} 
                        />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {integration?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {integration?.description}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs font-medium ${getStatusColor(integration?.status)}`}>
                        {getStatusText(integration?.status)}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-3">
                      Last activity: {integration?.lastActivity}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object?.entries(integration?.details)?.map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="text-foreground font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground text-center">
                Auto-refresh every 30 seconds
              </div>
              <div className="text-xs text-muted-foreground text-center mt-1">
                Last updated: {formatTimestamp(new Date())}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default IntegrationStatus;