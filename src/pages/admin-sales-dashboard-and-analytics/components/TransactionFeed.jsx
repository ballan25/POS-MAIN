import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TransactionFeed = ({ 
  apiEndpoint = '/api/transactions',
  websocketUrl = 'ws://localhost:8080/transactions',
  pollInterval = 30000, // 30 seconds fallback polling
  pageSize = 50 
}) => {
  const [transactions, setTransactions] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Fetch initial transactions
  const fetchTransactions = useCallback(async (pageNum = 1, append = false) => {
    try {
      setError(null);
      if (!append) setLoading(true);
      
      const response = await fetch(`${apiEndpoint}?page=${pageNum}&limit=${pageSize}&filter=${filter}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (append) {
        setTransactions(prev => [...prev, ...data.transactions]);
      } else {
        setTransactions(data.transactions || []);
      }
      
      setHasMoreData(data.hasMore || false);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [apiEndpoint, pageSize, filter]);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!isLive) return;

    try {
      wsRef.current = new WebSocket(websocketUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
        setError(null);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_transaction') {
            setTransactions(prev => [data.transaction, ...prev]);
          } else if (data.type === 'transaction_update') {
            setTransactions(prev => 
              prev.map(txn => 
                txn.id === data.transaction.id ? { ...txn, ...data.transaction } : txn
              )
            );
          } else if (data.type === 'transaction_delete') {
            setTransactions(prev => prev.filter(txn => txn.id !== data.transactionId));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        if (isLive && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current += 1;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
            connectWebSocket();
          }, delay);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Retrying...');
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to establish real-time connection');
    }
  }, [websocketUrl, isLive]);

  // Polling fallback
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(() => {
      if (isLive) {
        fetchTransactions(1, false);
      }
    }, pollInterval);
  }, [fetchTransactions, pollInterval, isLive]);

  // Initialize data fetching and real-time connection
  useEffect(() => {
    fetchTransactions(1, false);
  }, [fetchTransactions]);

  // Manage WebSocket connection
  useEffect(() => {
    if (isLive) {
      connectWebSocket();
      // Start polling as fallback
      startPolling();
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isLive, connectWebSocket, startPolling]);

  // Refresh data when filter changes
  useEffect(() => {
    setPage(1);
    fetchTransactions(1, false);
  }, [filter, fetchTransactions]);

  const filteredTransactions = transactions?.filter(transaction => {
    if (filter === 'all') return true;
    return transaction?.method?.toLowerCase() === (filter === 'mpesa' ? 'm-pesa' : filter);
  });

  const handleToggleLive = () => {
    setIsLive(!isLive);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchTransactions(1, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage, true);
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'm-pesa':
        return 'Smartphone';
      case 'cash':
        return 'Banknote';
      default:
        return 'CreditCard';
    }
  };

  const getMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'm-pesa':
        return 'text-success bg-success/10';
      case 'cash':
        return 'text-warning bg-warning/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'CheckCircle';
      case 'pending':
        return 'Clock';
      case 'failed':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'failed':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = parseISO(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(date, 'MMM dd, HH:mm');
  };

  const totalValue = filteredTransactions?.reduce((sum, txn) => sum + txn?.amount, 0);
  const mpesaCount = filteredTransactions?.filter(txn => txn?.method?.toLowerCase() === 'm-pesa')?.length;
  const cashCount = filteredTransactions?.filter(txn => txn?.method?.toLowerCase() === 'cash')?.length;

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Icon name="Loader" size={32} className="animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Activity" size={20} className="mr-2" />
            Live Transaction Feed
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">
              {isLive ? 'Live updates' : 'Paused'}
            </span>
            {error && (
              <span className="text-xs text-error ml-2">• {error}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleLive}
            iconName={isLive ? "Pause" : "Play"}
            iconSize={14}
            className="touch-feedback"
            title={isLive ? "Pause live updates" : "Resume live updates"}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            iconName="RefreshCw"
            iconSize={14}
            className={`touch-feedback ${loading ? 'animate-spin' : ''}`}
            title="Refresh feed"
            disabled={loading}
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-4">
        {[
          { key: 'all', label: 'All', count: filteredTransactions?.length },
          { key: 'mpesa', label: 'M-Pesa', count: mpesaCount },
          { key: 'cash', label: 'Cash', count: cashCount }
        ]?.map((option) => (
          <Button
            key={option?.key}
            variant={filter === option?.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(option?.key)}
            className="touch-feedback"
          >
            {option?.label} ({option?.count})
          </Button>
        ))}
      </div>

      {/* Feed Summary */}
      <div className="mb-4 p-3 bg-muted/50 rounded-md">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Value:</span>
          <span className="font-medium text-foreground">
            KES {totalValue?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-muted-foreground">Transactions:</span>
          <span className="font-medium text-foreground">
            {filteredTransactions?.length}
          </span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTransactions?.length > 0 ? (
          filteredTransactions?.map((transaction) => (
            <div 
              key={transaction?.id} 
              className="flex items-start space-x-3 p-3 border border-border rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMethodColor(transaction?.method)}`}>
                <Icon name={getMethodIcon(transaction?.method)} size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-foreground text-sm">
                    {transaction?.id}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon 
                      name={getStatusIcon(transaction?.status)} 
                      size={14} 
                      className={getStatusColor(transaction?.status)} 
                    />
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(transaction?.timestamp)}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-1">
                  {transaction?.cashier} • {transaction?.method}
                </div>
                
                <div className="text-xs text-muted-foreground mb-2">
                  {transaction?.items?.join(', ')}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">
                    KES {transaction?.amount?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      iconSize={12}
                      className="touch-feedback p-1"
                      title="View details"
                      onClick={() => alert(`Viewing transaction ${transaction?.id}`)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Receipt"
                      iconSize={12}
                      className="touch-feedback p-1"
                      title="View receipt"
                      onClick={() => alert(`Opening receipt for ${transaction?.id}`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="Inbox" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {error ? 'Failed to load transactions' : 'No transactions found for selected filter'}
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredTransactions?.length > 0 && hasMoreData && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronDown"
            iconPosition="right"
            className="touch-feedback"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionFeed;