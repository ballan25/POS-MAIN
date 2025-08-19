import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const RefundModal = ({ 
  isOpen, 
  onClose, 
  orderData, 
  onRefundComplete, 
  user 
}) => {
  const [refundType, setRefundType] = useState('full');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [managerApproval, setManagerApproval] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const refundReasons = [
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'wrong_order', label: 'Wrong Order' },
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'system_error', label: 'System Error' },
    { value: 'other', label: 'Other' }
  ];

  const handleRefundTypeChange = (type) => {
    setRefundType(type);
    if (type === 'full') {
      setRefundAmount(orderData?.total?.toString());
    } else {
      setRefundAmount('');
    }
  };

  const handleProcessRefund = async () => {
    if (!refundReason) {
      setError('Please select a refund reason');
      return;
    }

    if (user?.role !== 'manager' && !managerApproval) {
      setError('Manager approval required for refunds');
      return;
    }

    const amount = parseFloat(refundAmount);
    if (!amount || amount <= 0 || amount > orderData?.total) {
      setError('Invalid refund amount');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Mock refund processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const refundData = {
        refundId: 'REF' + Date.now()?.toString()?.slice(-8),
        orderId: orderData?.orderId,
        amount: amount,
        type: refundType,
        reason: refundReason,
        processedBy: user?.name || user?.email,
        approvedBy: user?.role === 'manager' ? user?.name : managerApproval,
        timestamp: new Date()?.toISOString(),
        originalPaymentMethod: orderData?.paymentMethod
      };

      onRefundComplete(refundData);
      onClose();
    } catch (err) {
      setError('Failed to process refund. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-custom z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-elevation-3 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Process Refund
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              iconName="X"
              iconSize={20}
            />
          </div>

          {/* Order Info */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono">{orderData?.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Amount:</span>
                <span className="font-semibold">
                  KES {orderData?.total?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="capitalize">{orderData?.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Refund Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-3">
              Refund Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={refundType === 'full' ? 'default' : 'outline'}
                onClick={() => handleRefundTypeChange('full')}
                className="touch-feedback"
              >
                Full Refund
              </Button>
              <Button
                variant={refundType === 'partial' ? 'default' : 'outline'}
                onClick={() => handleRefundTypeChange('partial')}
                className="touch-feedback"
              >
                Partial Refund
              </Button>
            </div>
          </div>

          {/* Refund Amount */}
          <div className="mb-4">
            <Input
              label="Refund Amount"
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e?.target?.value)}
              placeholder="0.00"
              disabled={refundType === 'full'}
              className="text-center"
            />
          </div>

          {/* Refund Reason */}
          <div className="mb-4">
            <Select
              label="Refund Reason"
              options={refundReasons}
              value={refundReason}
              onChange={setRefundReason}
              placeholder="Select reason for refund"
              required
            />
          </div>

          {/* Manager Approval */}
          {user?.role !== 'manager' && (
            <div className="mb-4">
              <Input
                label="Manager Approval"
                type="text"
                value={managerApproval}
                onChange={(e) => setManagerApproval(e?.target?.value)}
                placeholder="Manager name or ID"
                description="Manager approval required for refunds"
                required
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <Icon name="AlertCircle" size={16} className="mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Refund Summary */}
          {refundAmount && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                Refund Summary
              </h4>
              <div className="space-y-1 text-sm text-yellow-700">
                <div className="flex justify-between">
                  <span>Refund Amount:</span>
                  <span className="font-semibold">
                    KES {parseFloat(refundAmount || 0)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Refund Method:</span>
                  <span className="capitalize">{orderData?.paymentMethod}</span>
                </div>
                {refundType === 'partial' && (
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span>
                      KES {(orderData?.total - parseFloat(refundAmount || 0))?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleProcessRefund}
              disabled={!refundAmount || !refundReason || isProcessing}
              loading={isProcessing}
              className="flex-1"
              iconName="RefreshCw"
              iconPosition="left"
            >
              Process Refund
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;