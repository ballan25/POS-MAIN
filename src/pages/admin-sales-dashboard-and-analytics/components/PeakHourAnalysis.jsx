import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PeakHourAnalysis = ({ dateRange }) => {
  const [viewMode, setViewMode] = useState('transactions'); // transactions, revenue
  const [chartType, setChartType] = useState('area'); // area, bar
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch data when component mounts or dateRange changes
  useEffect(() => {
    fetchPeakHourData();
  }, [dateRange]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPeakHourData(true); // Silent refresh
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchPeakHourData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/peak-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const peakHourData = await response.json();
      
      // Transform data to ensure consistent hourly format
      const transformedData = peakHourData.map(hour => ({
        hour: typeof hour.hour === 'string' ? hour.hour : `${hour.hour.toString().padStart(2, '0')}`,
        transactions: hour.transactions || 0,
        revenue: hour.revenue || 0,
        avgOrderValue: hour.transactions > 0 ? (hour.revenue / hour.transactions) : 0
      }));

      setData(transformedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching peak hour data:', err);
      setError(err.message);
      
      // Fallback to empty array on error
      setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const viewOptions = [
    { key: 'transactions', label: 'Transactions', icon: 'ShoppingBag' },
    { key: 'revenue', label: 'Revenue', icon: 'DollarSign' }
  ];

  const chartOptions = [
    { key: 'area', label: 'Area', icon: 'Activity' },
    { key: 'bar', label: 'Bar', icon: 'BarChart3' }
  ];

  const formatValue = (value, type) => {
    switch (type) {
      case 'revenue':
        return `KES ${value?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
      case 'transactions':
        return `${value} txns`;
      default:
        return value;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {label}:00
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transactions:</span>
              <span className="font-medium">{data?.transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-medium">{formatValue(data?.revenue, 'revenue')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Order:</span>
              <span className="font-medium">
                KES {data?.avgOrderValue?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate analytics from data
  const getAnalytics = () => {
    if (!data || data.length === 0) {
      return {
        peakHour: null,
        totalTransactions: 0,
        totalRevenue: 0,
        avgTransactions: 0,
        busyHours: []
      };
    }

    const peakHour = data.reduce((max, hour) => 
      hour?.[viewMode] > max?.[viewMode] ? hour : max, data[0]);
    
    const totalTransactions = data.reduce((sum, hour) => sum + (hour?.transactions || 0), 0);
    const totalRevenue = data.reduce((sum, hour) => sum + (hour?.revenue || 0), 0);
    const avgTransactions = totalTransactions / data.length;
    const busyHours = data.filter(hour => (hour?.transactions || 0) > avgTransactions);

    return {
      peakHour,
      totalTransactions,
      totalRevenue,
      avgTransactions,
      busyHours
    };
  };

  const analytics = getAnalytics();

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diffInSeconds = Math.floor((now - lastUpdated) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  if (error && !data.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center">
          <Icon name="AlertTriangle" size={48} className="mx-auto text-error mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Peak Hour Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => fetchPeakHourData()}
            iconName="RefreshCw"
            iconPosition="left"
            className="touch-feedback"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Clock" size={20} className="mr-2" />
            Peak Hour Analysis
            {loading && (
              <div className="ml-2 animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
            )}
          </h3>
          <div className="flex items-center space-x-4 mt-1">
            {analytics.peakHour?.hour && (
              <p className="text-sm text-muted-foreground">
                Peak hour: <span className="text-foreground font-medium">{analytics.peakHour?.hour}:00</span>
                {' '}({formatValue(analytics.peakHour?.[viewMode], viewMode)})
              </p>
            )}
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Updated {formatLastUpdated()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {viewOptions?.map((option) => (
            <Button
              key={option?.key}
              variant={viewMode === option?.key ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(option?.key)}
              iconName={option?.icon}
              iconPosition="left"
              iconSize={16}
              className="touch-feedback"
              disabled={loading}
            >
              {option?.label}
            </Button>
          ))}
          
          <div className="border-l border-border pl-2 ml-2">
            {chartOptions?.map((option) => (
              <Button
                key={option?.key}
                variant={chartType === option?.key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartType(option?.key)}
                iconName={option?.icon}
                iconSize={16}
                className="touch-feedback"
                disabled={loading}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchPeakHourData()}
            iconName="RefreshCw"
            iconSize={16}
            className={`touch-feedback ${loading ? 'animate-spin' : ''}`}
            disabled={loading}
            title="Refresh data"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {/* Chart skeleton */}
          <div className="h-80 bg-muted animate-pulse rounded"></div>
          
          {/* Insights skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
                <div className="h-6 bg-muted rounded mb-1"></div>
                <div className="h-2 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      ) : data?.length > 0 ? (
        <div className="space-y-6">
          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorPeakHour" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="hour"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tickFormatter={(value) => 
                      viewMode === 'revenue' ? `${(value / 1000)?.toFixed(0)}k` : value
                    }
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={viewMode}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPeakHour)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="hour"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tickFormatter={(value) => 
                      viewMode === 'revenue' ? `${(value / 1000)?.toFixed(0)}k` : value
                    }
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey={viewMode}
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Peak Hour Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={16} className="text-primary" />
                <h4 className="text-sm font-medium text-foreground">Peak Performance</h4>
              </div>
              <div className="text-lg font-bold text-primary">
                {analytics.peakHour?.hour}:00
              </div>
              <div className="text-xs text-muted-foreground">
                {formatValue(analytics.peakHour?.[viewMode], viewMode)}
              </div>
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Clock" size={16} className="text-secondary" />
                <h4 className="text-sm font-medium text-foreground">Busy Hours</h4>
              </div>
              <div className="text-lg font-bold text-secondary">
                {analytics.busyHours?.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Above average activity
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="DollarSign" size={16} className="text-accent" />
                <h4 className="text-sm font-medium text-foreground">Hourly Average</h4>
              </div>
              <div className="text-lg font-bold text-accent">
                {viewMode === 'revenue' ? 
                  `KES ${(analytics.totalRevenue / data?.length)?.toFixed(0)}` :
                  Math.round(analytics.totalTransactions / data?.length)
                }
              </div>
              <div className="text-xs text-muted-foreground">
                Per hour today
              </div>
            </div>
          </div>

          {/* Hour-by-Hour Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Hourly Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data?.map((hour) => (
                <div 
                  key={hour?.hour} 
                  className={`p-3 border rounded-md transition-colors ${
                    hour === analytics.peakHour 
                      ? 'border-primary bg-primary/5' 
                      : (hour?.transactions || 0) > analytics.avgTransactions
                        ? 'border-secondary bg-secondary/5' 
                        : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-foreground">
                      {hour?.hour}:00
                    </div>
                    <div className="flex items-center space-x-1">
                      {hour === analytics.peakHour && (
                        <Icon name="Crown" size={14} className="text-primary" />
                      )}
                      {(hour?.transactions || 0) > analytics.avgTransactions && hour !== analytics.peakHour && (
                        <Icon name="TrendingUp" size={14} className="text-secondary" />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mt-1">
                    {hour?.transactions || 0} transactions
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {formatValue(hour?.revenue || 0, 'revenue')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Clock" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hourly data available</p>
            <Button
              onClick={() => fetchPeakHourData()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeakHourAnalysis;