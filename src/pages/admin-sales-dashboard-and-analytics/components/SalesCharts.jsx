import React, { useState, useEffect, useCallback } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SalesCharts = ({ 
  viewType = 'daily',
  onViewChange,
  apiEndpoint = '/api/sales/analytics',
  refreshInterval = 300000, // 5 minutes in milliseconds
  onError = (error) => console.error('Error fetching sales data:', error)
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const viewOptions = [
    { key: 'daily', label: 'Daily', icon: 'Calendar' },
    { key: 'weekly', label: 'Weekly', icon: 'BarChart3' },
    { key: 'monthly', label: 'Monthly', icon: 'TrendingUp' }
  ];

  // Fetch sales data function
  const fetchSalesData = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`${apiEndpoint}?viewType=${viewType}`, {
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
      
      // Validate and process data
      const validatedData = Array.isArray(result) ? result : result.data || [];
      
      // Ensure each item has required fields with proper data types
      const processedData = validatedData.map(item => ({
        date: item.date || new Date().toISOString().split('T')[0],
        revenue: parseFloat(item.revenue) || 0,
        transactions: parseInt(item.transactions) || 0,
        mpesa: parseFloat(item.mpesa) || 0,
        cash: parseFloat(item.cash) || 0,
        // Additional fields for comprehensive analytics
        averageOrderValue: parseFloat(item.averageOrderValue) || 0,
        refunds: parseFloat(item.refunds) || 0,
        ...item // Include any additional fields
      }));

      setData(processedData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      onError(err);
    }
  }, [apiEndpoint, viewType, onError]);

  // Initial data fetch
  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchSalesData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSalesData, refreshInterval]);

  // Handle view change
  const handleViewChange = useCallback((newViewType) => {
    setLoading(true);
    if (onViewChange) {
      onViewChange(newViewType);
    }
    // Data will be refetched due to viewType dependency in useEffect
  }, [onViewChange]);

  // Manual refresh function
  const handleRefresh = () => {
    setLoading(true);
    fetchSalesData();
  };

  const formatXAxis = (tickItem) => {
    try {
      const date = parseISO(tickItem);
      switch (viewType) {
        case 'daily':
          return format(date, 'MMM dd');
        case 'weekly':
          return format(date, 'MMM dd');
        case 'monthly':
          return format(date, 'MMM');
        default:
          return format(date, 'MMM dd');
      }
    } catch {
      return tickItem;
    }
  };

  const formatTooltipLabel = (label) => {
    try {
      const date = parseISO(label);
      return format(date, 'EEEE, MMMM dd, yyyy');
    } catch {
      return label;
    }
  };

  const formatCurrency = (value) => {
    return `KES ${value?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {formatTooltipLabel(label)}
          </p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-muted-foreground">{entry?.name}:</span>
              <span className="font-medium text-foreground">
                {entry?.name === 'Transactions' ? entry?.value : formatCurrency(entry?.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalRevenue = data?.reduce((sum, item) => sum + (item?.revenue || 0), 0);
  const totalTransactions = data?.reduce((sum, item) => sum + (item?.transactions || 0), 0);
  const totalMpesa = data?.reduce((sum, item) => sum + (item?.mpesa || 0), 0);
  const totalCash = data?.reduce((sum, item) => sum + (item?.cash || 0), 0);
  const averageOrder = totalRevenue / totalTransactions || 0;

  // Calculate growth rates
  const getGrowthRate = (currentData) => {
    if (currentData.length < 2) return 0;
    const current = currentData[currentData.length - 1]?.revenue || 0;
    const previous = currentData[currentData.length - 2]?.revenue || 0;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const growthRate = getGrowthRate(data);

  // Loading state
  if (loading && data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sales analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Icon name="AlertTriangle" size={48} className="mx-auto text-error mb-4" />
            <p className="text-error mb-2">Failed to load sales data</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="BarChart3" size={20} className="mr-2" />
            Sales Analytics
            {loading && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
          </h3>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
            <span>Total: {formatCurrency(totalRevenue)}</span>
            <span>•</span>
            <span>{totalTransactions.toLocaleString()} transactions</span>
            <span>•</span>
            <span>Avg: {formatCurrency(averageOrder)}</span>
            {growthRate !== 0 && (
              <>
                <span>•</span>
                <span className={`flex items-center ${growthRate > 0 ? 'text-success' : 'text-error'}`}>
                  <Icon 
                    name={growthRate > 0 ? 'TrendingUp' : 'TrendingDown'} 
                    size={12} 
                    className="mr-1" 
                  />
                  {Math.abs(growthRate).toFixed(1)}%
                </span>
              </>
            )}
            {lastUpdated && (
              <>
                <span>•</span>
                <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            iconSize={16}
            className="touch-feedback"
            disabled={loading}
          />
          
          {viewOptions?.map((option) => (
            <Button
              key={option?.key}
              variant={viewType === option?.key ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange(option?.key)}
              iconName={option?.icon}
              iconPosition="left"
              iconSize={16}
              className="touch-feedback"
              disabled={loading}
            >
              {option?.label}
            </Button>
          ))}
        </div>
      </div>

      {error && data.length > 0 && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md">
          <p className="text-sm text-error">Warning: Using cached data due to fetch error: {error}</p>
        </div>
      )}

      {data?.length > 0 ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
              <div className="flex items-center space-x-2">
                <Icon name="Smartphone" size={16} className="text-primary" />
                <span className="text-sm font-medium">M-Pesa</span>
              </div>
              <div className="text-lg font-bold text-foreground mt-1">
                {formatCurrency(totalMpesa)}
              </div>
              <div className="text-xs text-muted-foreground">
                {((totalMpesa / totalRevenue) * 100).toFixed(1)}% of total
              </div>
            </div>
            
            <div className="p-3 bg-muted/50 border border-border rounded-md">
              <div className="flex items-center space-x-2">
                <Icon name="Banknote" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">Cash</span>
              </div>
              <div className="text-lg font-bold text-foreground mt-1">
                {formatCurrency(totalCash)}
              </div>
              <div className="text-xs text-muted-foreground">
                {((totalCash / totalRevenue) * 100).toFixed(1)}% of total
              </div>
            </div>

            <div className="p-3 bg-success/10 border border-success/20 rounded-md">
              <div className="flex items-center space-x-2">
                <Icon name="Receipt" size={16} className="text-success" />
                <span className="text-sm font-medium">Transactions</span>
              </div>
              <div className="text-lg font-bold text-foreground mt-1">
                {totalTransactions.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Avg: {formatCurrency(averageOrder)}
              </div>
            </div>

            <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
              <div className="flex items-center space-x-2">
                <Icon name={growthRate >= 0 ? 'TrendingUp' : 'TrendingDown'} size={16} className="text-warning" />
                <span className="text-sm font-medium">Growth</span>
              </div>
              <div className={`text-lg font-bold mt-1 ${growthRate >= 0 ? 'text-success' : 'text-error'}`}>
                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                vs previous period
              </div>
            </div>
          </div>

          {/* Revenue and Transactions Chart */}
          <div className="h-80">
            <h4 className="text-sm font-medium text-foreground mb-4">Revenue & Transaction Trends</h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  yAxisId="revenue"
                  orientation="left"
                  tickFormatter={(value) => `KES ${(value / 1000)?.toFixed(0)}k`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  yAxisId="transactions"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue (KES)"
                />
                <Line
                  yAxisId="transactions"
                  type="monotone"
                  dataKey="transactions"
                  stroke="hsl(var(--accent-foreground))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent-foreground))", strokeWidth: 2, r: 4 }}
                  name="Transactions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Chart */}
          <div className="h-80">
            <h4 className="text-sm font-medium text-foreground mb-4">Payment Method Breakdown</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tickFormatter={(value) => `KES ${(value / 1000)?.toFixed(0)}k`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="mpesa"
                  stackId="payment"
                  fill="hsl(var(--primary))"
                  name="M-Pesa (KES)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="cash"
                  stackId="payment"
                  fill="hsl(var(--muted-foreground))"
                  name="Cash (KES)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Icon name="BarChart3" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No data available for the selected period</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Refresh Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCharts;