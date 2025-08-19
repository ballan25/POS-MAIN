import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const KPIWidget = ({ title, value, change, icon, prefix = 'KES', suffix = '', loading = false }) => {
  const isPositive = change > 0;
  const changeColor = isPositive ? 'text-success' : 'text-error';
  const changeIcon = isPositive ? 'TrendingUp' : 'TrendingDown';

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-lg"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
          <div className="h-4 bg-muted rounded w-16"></div>
        </div>
        <div className="h-8 bg-muted rounded mb-2"></div>
        <div className="h-3 bg-muted rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={20} className="text-primary" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <div className={`flex items-center text-sm ${changeColor}`}>
          <Icon name={changeIcon} size={14} className="mr-1" />
          <span>{Math.abs(change)?.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="text-2xl font-bold text-foreground">
        {prefix && `${prefix} `}
        {typeof value === 'number' ? value?.toLocaleString('en-KE', { 
          minimumFractionDigits: prefix === 'KES' ? 2 : 0 
        }) : value}
        {suffix && ` ${suffix}`}
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        vs. previous period
      </div>
    </div>
  );
};

const KPIWidgets = ({ dateRange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKPIData();
  }, [dateRange]);

  const fetchKPIData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/dashboard/kpis', {
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

      const kpiData = await response.json();
      setData(kpiData);
    } catch (err) {
      console.error('Error fetching KPI data:', err);
      setError(err.message);
      
      // Fallback to sample data on error
      setData({
        dailyRevenue: 0,
        dailyRevenueChange: 0,
        transactionCount: 0,
        transactionCountChange: 0,
        averageOrderValue: 0,
        averageOrderValueChange: 0,
        mpesaRatio: 0,
        cashRatio: 0,
        mpesaRatioChange: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full bg-card border border-error/20 rounded-lg p-6 text-center">
          <Icon name="AlertTriangle" size={24} className="mx-auto text-error mb-2" />
          <p className="text-error font-medium">Failed to load KPI data</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
          <button 
            onClick={fetchKPIData}
            className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPIWidget
        title="Daily Revenue"
        value={data?.dailyRevenue}
        change={data?.dailyRevenueChange}
        icon="DollarSign"
        prefix="KES"
        loading={loading}
      />
      
      <KPIWidget
        title="Transaction Count"
        value={data?.transactionCount}
        change={data?.transactionCountChange}
        icon="ShoppingBag"
        prefix=""
        loading={loading}
      />
      
      <KPIWidget
        title="Average Order Value"
        value={data?.averageOrderValue}
        change={data?.averageOrderValueChange}
        icon="TrendingUp"
        prefix="KES"
        loading={loading}
      />
      
      <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
        {loading ? (
          <div className="animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-lg"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </div>
            </div>
            <div className="mt-4 w-full bg-muted rounded-full h-2"></div>
            <div className="mt-2 h-2 bg-muted rounded w-40"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="CreditCard" size={20} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Payment Methods</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-foreground">M-Pesa</span>
                </div>
                <div className="text-sm font-medium">
                  {data?.mpesaRatio?.toFixed(1)}%
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm text-foreground">Cash</span>
                </div>
                <div className="text-sm font-medium">
                  {data?.cashRatio?.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data?.mpesaRatio}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              M-Pesa usage trending {data?.mpesaRatioChange > 0 ? 'up' : 'down'} by {Math.abs(data?.mpesaRatioChange)?.toFixed(1)}%
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KPIWidgets;