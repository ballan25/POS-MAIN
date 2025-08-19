import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const CashPaymentForm = ({ 
  total, 
  onPaymentComplete, 
  isProcessing, 
  onCancel 
}) => {
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);
  const [error, setError] = useState('');

  const quickAmounts = [50, 100, 500, 1000, 2000, 5000];

  useEffect(() => {
    const received = parseFloat(amountReceived) || 0;
    const calculatedChange = received - total;
    setChange(calculatedChange);
    
    if (received > 0 && received < total) {
      setError('Amount received is less than total');
    } else {
      setError('');
    }
  }, [amountReceived, total]);

  const handleQuickAmount = (amount) => {
    setAmountReceived(amount?.toString());
  };

  const handleNumpadInput = (digit) => {
    if (digit === 'clear') {
      setAmountReceived('');
    } else if (digit === 'backspace') {
      setAmountReceived(prev => prev?.slice(0, -1));
    } else if (digit === '.') {
      if (!amountReceived?.includes('.')) {
        setAmountReceived(prev => prev + '.');
      }
    } else {
      setAmountReceived(prev => prev + digit);
    }
  };

  const handleProcessPayment = () => {
    const received = parseFloat(amountReceived);
    if (received >= total) {
      onPaymentComplete({
        method: 'cash',
        amountReceived: received,
        change: change,
        timestamp: new Date()?.toISOString()
      });
    }
  };

  const numpadButtons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '.', '0', 'backspace'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Cash Payment
        </h3>
        <div className="text-lg text-muted-foreground">
          Total Amount: <span className="font-bold text-primary">
            KES {total?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      {/* Quick Amount Buttons */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Quick Amount Selection
        </label>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts?.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              onClick={() => handleQuickAmount(amount)}
              disabled={isProcessing}
              className="h-12 text-sm font-medium"
            >
              KES {amount}
            </Button>
          ))}
        </div>
      </div>
      {/* Amount Input */}
      <div>
        <Input
          label="Amount Received"
          type="number"
          value={amountReceived}
          onChange={(e) => setAmountReceived(e?.target?.value)}
          placeholder="0.00"
          error={error}
          disabled={isProcessing}
          className="text-center text-xl font-bold"
        />
      </div>
      {/* Numeric Keypad */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Numeric Keypad
        </label>
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {numpadButtons?.map((button) => (
            <Button
              key={button}
              variant="outline"
              onClick={() => handleNumpadInput(button)}
              disabled={isProcessing}
              className="h-12 text-lg font-semibold"
              iconName={button === 'backspace' ? 'Delete' : undefined}
              iconSize={20}
            >
              {button === 'backspace' ? '' : button}
            </Button>
          ))}
          <Button
            variant="destructive"
            onClick={() => handleNumpadInput('clear')}
            disabled={isProcessing}
            className="h-12 col-span-3"
          >
            Clear
          </Button>
        </div>
      </div>
      {/* Change Calculation */}
      {amountReceived && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Change to Return:</span>
            <span className={`text-lg font-bold ${
              change >= 0 ? 'text-success' : 'text-error'
            }`}>
              KES {Math.abs(change)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {change < 0 && (
            <div className="flex items-center mt-2 text-error">
              <Icon name="AlertCircle" size={16} className="mr-2" />
              <span className="text-sm">Insufficient amount received</span>
            </div>
          )}
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={handleProcessPayment}
          disabled={!amountReceived || parseFloat(amountReceived) < total || isProcessing}
          loading={isProcessing}
          className="flex-1"
          iconName="Check"
          iconPosition="left"
        >
          Complete Payment
        </Button>
      </div>
    </div>
  );
};

export default CashPaymentForm;