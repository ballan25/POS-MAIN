import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReceiptPreview = ({ selectedReceipt, onPrint, onDownload, onClose }) => {
  if (!selectedReceipt) {
    return (
      <div className="flex-1 bg-card border border-border rounded-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Receipt" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Receipt Selected</h3>
          <p className="text-muted-foreground">Select a receipt from the sidebar to preview</p>
        </div>
      </div>
    );
  }

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
    <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-3">
          <Icon name="Receipt" size={20} className="text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Receipt Preview</h3>
            <p className="text-sm text-muted-foreground">Order #{selectedReceipt?.orderNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
            className="touch-feedback"
          >
            Download
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onPrint}
            iconName="Printer"
            iconPosition="left"
            iconSize={16}
            className="touch-feedback"
          >
            Print
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={16}
            className="touch-feedback"
          />
        </div>
      </div>
      {/* Receipt Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-6 print:shadow-none print:border-none">
          {/* Shop Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary-foreground" fill="currentColor">
                  <circle cx="12" cy="8" r="3" />
                  <circle cx="12" cy="16" r="2" />
                  <path d="M8 12h8" strokeWidth="2" stroke="currentColor" fill="none" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Boba Bliss Café</h2>
            <p className="text-sm text-gray-600">Premium Bubble Tea & Refreshments</p>
            <p className="text-xs text-gray-500 mt-1">Westlands, Nairobi | Tel: +254 700 123 456</p>
          </div>

          {/* Order Details */}
          <div className="border-t border-b border-gray-200 py-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Order #:</span>
              <span className="font-mono text-gray-900">{selectedReceipt?.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-900">{formatDate(selectedReceipt?.date)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Cashier:</span>
              <span className="text-gray-900">{selectedReceipt?.cashier}</span>
            </div>
            {selectedReceipt?.customerPhone && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer:</span>
                <span className="text-gray-900">{selectedReceipt?.customerPhone}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {selectedReceipt?.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{item?.name}</span>
                      {item?.size && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {item?.size}
                        </span>
                      )}
                    </div>
                    {item?.toppings && item?.toppings?.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">
                          Add-ons: {item?.toppings?.join(', ')}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">Qty: {item?.quantity}</span>
                      <span className="text-sm text-gray-600">{formatCurrency(item?.unitPrice)}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item?.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">{formatCurrency(selectedReceipt?.subtotal)}</span>
              </div>
              {selectedReceipt?.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (16%):</span>
                  <span className="text-gray-900">{formatCurrency(selectedReceipt?.tax)}</span>
                </div>
              )}
              {selectedReceipt?.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(selectedReceipt?.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">{formatCurrency(selectedReceipt?.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Payment Method:</span>
              <span className="text-gray-900 capitalize">{selectedReceipt?.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="text-gray-900">{formatCurrency(selectedReceipt?.amountPaid)}</span>
            </div>
            {selectedReceipt?.change > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Change:</span>
                <span className="text-gray-900">{formatCurrency(selectedReceipt?.change)}</span>
              </div>
            )}
            {selectedReceipt?.mpesaCode && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">M-Pesa Code:</span>
                <span className="font-mono text-gray-900">{selectedReceipt?.mpesaCode}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
            <p className="mb-2">Thank you for choosing Boba Bliss Café!</p>
            <p className="mb-2">Follow us @BobaBlisCafe for updates & offers</p>
            <p>Visit again soon for more delicious bubble tea!</p>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p>Receipt generated on {formatDate(new Date())}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;