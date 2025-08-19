import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DataTable = ({ 
  onEdit, 
  onBulkOperation, 
  user,
  apiEndpoint = '/api/transactions',
  refreshInterval = 30000, // 30 seconds default
  onError,
  filters = {} // External filters (e.g., from cashier filter, date range)
}) => {
  // Data fetching states
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // UI states
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editingRow, setEditingRow] = useState(null);

  // Fetch transactions data
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add external filters
      if (filters.cashiers && filters.cashiers.length > 0) {
        queryParams.append('cashiers', filters.cashiers.join(','));
      }
      if (filters.dateRange) {
        if (filters.dateRange.start) queryParams.append('start_date', filters.dateRange.start);
        if (filters.dateRange.end) queryParams.append('end_date', filters.dateRange.end);
      }
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.method) queryParams.append('method', filters.method);

      // Add sorting parameters
      queryParams.append('sort', sortConfig.key);
      queryParams.append('order', sortConfig.direction);
      
      const url = `${apiEndpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
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

      const responseData = await response.json();
      
      // Assuming the API returns an array of transactions or { transactions: [...], total: number }
      const transactionsList = Array.isArray(responseData) ? responseData : responseData.transactions || [];
      
      setData(transactionsList);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, filters, sortConfig, onError]);

  // Initial fetch and setup interval for real-time updates
  useEffect(() => {
    fetchTransactions();

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      fetchTransactions();
    }, refreshInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchTransactions, refreshInterval]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, statusFilter, methodFilter]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchTransactions();
  };

  // Edit transaction via API
  const handleEdit = async (transaction) => {
    if (user?.role !== 'manager') {
      alert('Only managers can edit transactions');
      return;
    }
    setEditingRow(transaction?.id);
  };

  const handleSaveEdit = async (transactionId, newData) => {
    try {
      const response = await fetch(`${apiEndpoint}/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update transaction: ${response.status}`);
      }

      const updatedTransaction = await response.json();
      
      // Update local data
      setData(currentData => 
        currentData.map(transaction => 
          transaction.id === transactionId ? updatedTransaction : transaction
        )
      );
      
      setEditingRow(null);
      onEdit?.(transactionId, updatedTransaction);
      
    } catch (err) {
      console.error('Error updating transaction:', err);
      alert(`Failed to update transaction: ${err.message}`);
    }
  };

  // Bulk operations via API
  const handleBulkAction = async (action) => {
    if (selectedRows?.length === 0) {
      alert('Please select transactions first');
      return;
    }

    try {
      let response;
      
      switch (action) {
        case 'export':
          // Handle export - could be a different endpoint or client-side processing
          response = await fetch(`${apiEndpoint}/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_ids: selectedRows }),
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
          }
          break;
          
        case 'delete':
          if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} transactions?`)) {
            return;
          }
          
          response = await fetch(`${apiEndpoint}/bulk-delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_ids: selectedRows }),
          });
          
          if (response.ok) {
            // Remove deleted transactions from local data
            setData(currentData => 
              currentData.filter(transaction => !selectedRows.includes(transaction.id))
            );
            alert(`${selectedRows.length} transactions deleted successfully`);
          }
          break;
          
        default:
          throw new Error(`Unknown bulk action: ${action}`);
      }
      
      if (!response.ok) {
        throw new Error(`Bulk operation failed: ${response.status}`);
      }
      
    } catch (err) {
      console.error('Bulk operation error:', err);
      alert(`Bulk operation failed: ${err.message}`);
    } finally {
      onBulkOperation?.(action, selectedRows);
      setSelectedRows([]);
    }
  };

  // View transaction details via API
  const handleViewTransaction = async (transactionId) => {
    try {
      const response = await fetch(`${apiEndpoint}/${transactionId}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const transactionDetails = await response.json();
        // You could open a modal here or navigate to a detail page
        console.log('Transaction details:', transactionDetails);
        alert(`Viewing transaction ${transactionId}`);
      }
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      alert('Failed to load transaction details');
    }
  };

  // Get receipt via API
  const handleViewReceipt = async (transactionId) => {
    try {
      const response = await fetch(`${apiEndpoint}/${transactionId}/receipt`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const receiptData = await response.json();
        // Handle receipt display - could open in new window, modal, etc.
        console.log('Receipt data:', receiptData);
        alert(`Opening receipt for ${transactionId}`);
      }
    } catch (err) {
      console.error('Error fetching receipt:', err);
      alert('Failed to load receipt');
    }
  };

  // Filtering and searching (client-side for better UX)
  const filteredData = useMemo(() => {
    return data?.filter(transaction => {
      const matchesSearch = !searchTerm || 
        transaction?.id?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        transaction?.cashier?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        transaction?.items?.some(item => 
          item?.toLowerCase()?.includes(searchTerm?.toLowerCase())
        );
      
      const matchesStatus = statusFilter === 'all' || 
        transaction?.status === statusFilter;
      
      const matchesMethod = methodFilter === 'all' || 
        transaction?.method?.toLowerCase() === methodFilter?.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [data, searchTerm, statusFilter, methodFilter]);

  // Client-side sorting (server-side sorting already applied, this is for additional sorting)
  const sortedData = useMemo(() => {
    if (!sortConfig?.key) return filteredData;
    
    return [...filteredData]?.sort((a, b) => {
      let aValue = a?.[sortConfig?.key];
      let bValue = b?.[sortConfig?.key];
      
      // Handle date sorting
      if (sortConfig?.key === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }
      
      if (aValue < bValue) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData?.length / pageSize);
  const paginatedData = sortedData?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectRow = (transactionId) => {
    setSelectedRows(current => 
      current?.includes(transactionId)
        ? current?.filter(id => id !== transactionId)
        : [...current, transactionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows?.length === paginatedData?.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData?.map(row => row?.id));
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      failed: 'bg-error/10 text-error border-error/20'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors?.[status] || 'bg-muted text-muted-foreground border-muted'}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getMethodBadge = (method) => {
    const colors = {
      'm-pesa': 'bg-success/10 text-success',
      'cash': 'bg-warning/10 text-warning'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors?.[method?.toLowerCase()] || 'bg-primary/10 text-primary'}`}>
        {method}
      </span>
    );
  };

  const SortButton = ({ column, children }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center space-x-1 text-left hover:text-primary transition-colors"
    >
      <span>{children}</span>
      <Icon
        name={
          sortConfig?.key === column
            ? sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown' : 'ChevronsUpDown'
        }
        size={14}
      />
    </button>
  );

  // Loading state
  if (loading && data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading transactions...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Table" size={20} className="mr-2" />
            Transaction Details
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-xs touch-feedback"
          >
            <Icon name="RefreshCw" size={14} className="mr-1" />
            Retry
          </Button>
        </div>
        <div className="text-center text-error">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4" />
          <p>Failed to load transactions: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Table" size={20} className="mr-2" />
          Transaction Details
          {loading && (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary ml-2"></div>
          )}
        </h3>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-xs touch-feedback"
            disabled={loading}
          >
            <Icon name="RefreshCw" size={14} className="mr-1" />
            Refresh
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {filteredData?.length} transactions
          </div>
          {selectedRows?.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-foreground">
                {selectedRows?.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
                iconName="Download"
                iconSize={14}
                className="touch-feedback"
              >
                Export
              </Button>
              {user?.role === 'manager' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  iconName="Trash2"
                  iconSize={14}
                  className="touch-feedback text-error hover:text-error"
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {error && data.length > 0 && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md">
          <div className="flex items-center text-error text-sm">
            <Icon name="AlertCircle" size={14} className="mr-2" />
            Update failed: {error}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Input
            placeholder="Search transactions, cashiers, items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            iconName="Search"
            iconPosition="left"
          />
        </div>
        
        <div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e?.target?.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
        
        <div>
          <Select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e?.target?.value)}
          >
            <option value="all">All Methods</option>
            <option value="m-pesa">M-Pesa</option>
            <option value="cash">Cash</option>
          </Select>
        </div>
        
        <div>
          <Select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e?.target?.value))}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-3 text-left">
                  <Checkbox
                    checked={selectedRows?.length === paginatedData?.length && paginatedData?.length > 0}
                    indeterminate={selectedRows?.length > 0 && selectedRows?.length < paginatedData?.length}
                    onChange={handleSelectAll}
                    className="touch-feedback"
                  />
                </th>
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  <SortButton column="id">Transaction ID</SortButton>
                </th>
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  <SortButton column="timestamp">Time</SortButton>
                </th>
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  <SortButton column="amount">Amount</SortButton>
                </th>
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  <SortButton column="method">Method</SortButton>
                </th>
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  <SortButton column="cashier">Cashier</SortButton>
                </th>
                <th className="p-3 text-left text-sm font-medium text-foreground">Items</th>
                <th className="p-3 text-left text-sm font-medium text-foreground">
                  <SortButton column="status">Status</SortButton>
                </th>
                <th className="p-3 text-right text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData?.map((transaction) => (
                <tr
                  key={transaction?.id}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${
                    selectedRows?.includes(transaction?.id) ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedRows?.includes(transaction?.id)}
                      onChange={() => handleSelectRow(transaction?.id)}
                      className="touch-feedback"
                    />
                  </td>
                  <td className="p-3">
                    <div className="font-mono text-sm text-foreground">
                      {transaction?.id}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-foreground">
                      {format(parseISO(transaction?.timestamp), 'MMM dd, HH:mm')}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm font-medium text-foreground">
                      KES {transaction?.amount?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="p-3">
                    {getMethodBadge(transaction?.method)}
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-foreground">
                      {transaction?.cashier}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {transaction?.items?.join(', ')}
                    </div>
                  </td>
                  <td className="p-3">
                    {getStatusBadge(transaction?.status)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTransaction(transaction?.id)}
                        iconName="Eye"
                        iconSize={14}
                        className="touch-feedback"
                        title="View details"
                      />
                      {user?.role === 'manager' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                          iconName="Edit"
                          iconSize={14}
                          className="touch-feedback"
                          title="Edit transaction"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReceipt(transaction?.id)}
                        iconName="Receipt"
                        iconSize={14}
                        className="touch-feedback"
                        title="View receipt"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData?.length)} of {filteredData?.length} transactions
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              iconName="ChevronLeft"
              iconSize={14}
              className="touch-feedback"
            >
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {[...Array(Math.min(5, totalPages))]?.map((_, index) => {
                const pageNum = currentPage - 2 + index;
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="touch-feedback w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              iconName="ChevronRight"
              iconSize={14}
              className="touch-feedback"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Last updated timestamp */}
      {lastUpdated && (
        <div className="mt-4 text-xs text-muted-foreground text-center">
          <Icon name="Clock" size={12} className="inline mr-1" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      {paginatedData?.length === 0 && !loading && (
        <div className="text-center py-12">
          <Icon name="Table" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {filteredData?.length === 0 ? 'No transactions found' : 'No data to display'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DataTable;