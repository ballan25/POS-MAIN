import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductPerformance = ({ 
  apiEndpoint = '/api/products/performance',
  refreshInterval = 300000, // 5 minutes in milliseconds
  onError = (error) => console.error('Error fetching product data:', error)
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [viewMode, setViewMode] = useState('revenue'); // revenue, quantity, growth
  const [chartType, setChartType] = useState('bar'); // bar, pie

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))', 
    'hsl(var(--accent))',
    'hsl(var(--muted-foreground))',
    'hsl(var(--warning))'
  ];

  const viewOptions = [
    { key: 'revenue', label: 'Revenue', icon: 'DollarSign' },
    { key: 'quantity', label: 'Quantity', icon: 'Package' },
    { key: 'growth', label: 'Growth', icon: 'TrendingUp' }
  ];

  const chartOptions = [
    { key: 'bar', label: 'Bar', icon: 'BarChart3' },
    { key: 'pie', label: 'Pie', icon: 'PieChart' }
  ];

  // Fetch data function
  const fetchProductData = useCallback(async () => {
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
      
      // Validate data structure
      const validatedData = Array.isArray(result) ? result : result.data || [];
      
      // Ensure each item has required fields
      const processedData = validatedData.map(item => ({
        name: item.name || 'Unknown Product',
        revenue: parseFloat(item.revenue) || 0,
        quantity: parseInt(item.quantity) || 0,
        growth: parseFloat(item.growth) || 0,
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
  }, [apiEndpoint, onError]);

  // Initial data fetch
  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchProductData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchProductData, refreshInterval]);

  // Manual refresh function
  const handleRefresh = () => {
    setLoading(true);
    fetchProductData();
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'revenue':
        return `KES ${value?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
      case 'quantity':
        return `${value} units`;
      case 'growth':
        return `${value > 0 ? '+' : ''}${value?.toFixed(1)}%`;
      default:
        return value;
    }
  };

  const getGrowthColor = (growth) => {
    if (growth > 10) return 'text-success';
    if (growth > 0) return 'text-warning';
    return 'text-error';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-medium">{formatValue(data?.revenue, 'revenue')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-medium">{formatValue(data?.quantity, 'quantity')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Growth:</span>
              <span className={`font-medium ${getGrowthColor(data?.growth)}`}>
                {formatValue(data?.growth, 'growth')}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{data?.name}</p>
          <div className="text-sm">
            <span className="text-muted-foreground">Value:</span>
            <span className="font-medium ml-2">{formatValue(data?.[viewMode], viewMode)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const sortedData = [...data]?.sort((a, b) => b?.[viewMode] - a?.[viewMode]);
  const topProduct = sortedData?.[0];

  // Loading state
  if (loading && data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product data...</p>
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
            <p className="text-error mb-2">Failed to load product data</p>
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
            <Icon name="Package" size={20} className="mr-2" />
            Product Performance
            {loading && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
          </h3>
          <div className="flex items-center space-x-4 mt-1">
            {topProduct && (
              <p className="text-sm text-muted-foreground">
                Top performer: <span className="text-foreground font-medium">{topProduct?.name}</span>
              </p>
            )}
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
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
              variant={viewMode === option?.key ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(option?.key)}
              iconName={option?.icon}
              iconPosition="left"
              iconSize={16}
              className="touch-feedback"
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
              />
            ))}
          </div>
        </div>
      </div>

      {error && data.length > 0 && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md">
          <p className="text-sm text-error">Warning: Using cached data due to fetch error: {error}</p>
        </div>
      )}

      {data?.length > 0 ? (
        <div className="space-y-6">
          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={sortedData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    type="number"
                    tickFormatter={(value) => 
                      viewMode === 'revenue' ? `${(value / 1000)?.toFixed(0)}k` :
                      viewMode === 'growth' ? `${value}%` : value
                    }
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    width={120}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey={viewMode}
                    fill={viewMode === 'growth' ? undefined : 'hsl(var(--primary))'}
                    radius={[0, 4, 4, 0]}
                  >
                    {viewMode === 'growth' && 
                      sortedData?.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry?.growth > 10 ? 'hsl(var(--success))' : 
                                entry?.growth > 0 ? 'hsl(var(--warning))': 'hsl(var(--error))'}
                        />
                      ))
                    }
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={sortedData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey={viewMode}
                    label={({ name, value }) => 
                      `${name}: ${viewMode === 'revenue' ? `${(value / 1000)?.toFixed(0)}k` : 
                                  viewMode === 'growth' ? `${value}%` : value}`
                    }
                  >
                    {sortedData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Product Rankings */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Product Rankings</h4>
            <div className="space-y-3">
              {sortedData?.map((product, index) => (
                <div key={product?.name} className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-600 text-white': 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{product?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatValue(product?.quantity, 'quantity')} sold
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-foreground">
                      {formatValue(product?.[viewMode], viewMode)}
                    </div>
                    <div className={`text-xs ${getGrowthColor(product?.growth)}`}>
                      {formatValue(product?.growth, 'growth')} growth
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No product data available</p>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
              Refresh Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPerformance;