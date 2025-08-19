import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ReceiptSidebar = ({ 
  receipts, 
  selectedReceipt, 
  onSelectReceipt, 
  onBulkPrint, 
  onRefresh,
  user 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCashier, setFilterCashier] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [selectedReceipts, setSelectedReceipts] = useState([]);

  const paymentOptions = [
    { value: '', label: 'All Payment Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'mpesa', label: 'M-Pesa' }
  ];

  const cashierOptions = [
    { value: '', label: 'All Cashiers' },
    ...Array.from(new Set(receipts.map(r => r.cashier)))?.map(cashier => ({
      value: cashier,
      label: cashier
    }))
  ];

  const filteredReceipts = receipts?.filter(receipt => {
    const matchesSearch = receipt?.orderNumber?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         receipt?.customerPhone?.includes(searchTerm);
    const matchesDate = !filterDate || receipt?.date?.startsWith(filterDate);
    const matchesCashier = !filterCashier || receipt?.cashier === filterCashier;
    const matchesPayment = !filterPayment || receipt?.paymentMethod === filterPayment;
    
    return matchesSearch && matchesDate && matchesCashier && matchesPayment;
  });

  const handleSelectAll = () => {
    if (selectedReceipts?.length === filteredReceipts?.length) {
      setSelectedReceipts([]);
    } else {
      setSelectedReceipts(filteredReceipts?.map(r => r?.id));
    }
  };

  const handleSelectReceipt = (receiptId) => {
    setSelectedReceipts(prev => 
      prev?.includes(receiptId) 
        ? prev?.filter(id => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  const formatCurrency = (amount) => {
    return `KES ${amount?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-80 bg-card border border-border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Receipt" size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Receipts</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            iconName="RefreshCw"
            iconSize={16}
            className="touch-feedback"
            title="Refresh receipts"
          />
        </div>

        {/* Search */}
        <Input
          type="search"
          placeholder="Search by order # or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
          className="mb-3"
        />

        {/* Filters */}
        <div className="space-y-3">
          <Input
            type="date"
            label="Filter by Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e?.target?.value)}
          />

          <Select
            label="Cashier"
            options={cashierOptions}
            value={filterCashier}
            onChange={setFilterCashier}
          />

          <Select
            label="Payment Method"
            options={paymentOptions}
            value={filterPayment}
            onChange={setFilterPayment}
          />
        </div>
      </div>
      {/* Bulk Actions */}
      {user?.role === 'manager' && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selectedReceipts?.length === filteredReceipts?.length && filteredReceipts?.length > 0}
                onChange={handleSelectAll}
                className="rounded border-border"
              />
              <span className="text-foreground">Select All ({selectedReceipts?.length})</span>
            </label>
          </div>
          
          {selectedReceipts?.length > 0 && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkPrint(selectedReceipts)}
                iconName="Printer"
                iconPosition="left"
                iconSize={14}
                className="flex-1 touch-feedback"
              >
                Print ({selectedReceipts?.length})
              </Button>
            </div>
          )}
        </div>
      )}
      {/* Receipt List */}
      <div className="flex-1 overflow-y-auto">
        {filteredReceipts?.length === 0 ? (
          <div className="p-4 text-center">
            <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No receipts found</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredReceipts?.map((receipt) => (
              <div
                key={receipt?.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all touch-feedback ${
                  selectedReceipt?.id === receipt?.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => onSelectReceipt(receipt)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {user?.role === 'manager' && (
                      <input
                        type="checkbox"
                        checked={selectedReceipts?.includes(receipt?.id)}
                        onChange={(e) => {
                          e?.stopPropagation();
                          handleSelectReceipt(receipt?.id);
                        }}
                        className="rounded border-border"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        #{receipt?.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(receipt?.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(receipt?.total)}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Icon 
                        name={receipt?.paymentMethod === 'mpesa' ? 'Smartphone' : 'Banknote'} 
                        size={12} 
                        className="text-muted-foreground" 
                      />
                      <span className="text-xs text-muted-foreground capitalize">
                        {receipt?.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Cashier: {receipt?.cashier}</span>
                  <span>{receipt?.items?.length} items</span>
                </div>

                {receipt?.customerPhone && (
                  <div className="mt-2 flex items-center space-x-1">
                    <Icon name="Phone" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {receipt?.customerPhone}
                    </span>
                  </div>
                )}

                {receipt?.status && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      receipt?.status === 'printed' ?'bg-success/10 text-success' :'bg-warning/10 text-warning'
                    }`}>
                      <Icon 
                        name={receipt?.status === 'printed' ? 'Check' : 'Clock'} 
                        size={10} 
                        className="mr-1" 
                      />
                      {receipt?.status}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Summary */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Total Receipts:</span>
            <span className="font-medium">{filteredReceipts?.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Value:</span>
            <span className="font-medium">
              {formatCurrency(filteredReceipts?.reduce((sum, r) => sum + r?.total, 0))}
            </span>
          </div>
          {selectedReceipts?.length > 0 && (
            <div className="flex justify-between text-primary">
              <span>Selected:</span>
              <span className="font-medium">{selectedReceipts?.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptSidebar;