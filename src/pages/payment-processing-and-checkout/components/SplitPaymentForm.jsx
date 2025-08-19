import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const SplitPaymentForm = ({ 
  total, 
  onPaymentComplete, 
  isProcessing, 
  onCancel 
}) => {
  const [cashAmount, setCashAmount] = useState('');
  const [mpesaAmount, setMpesaAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: amounts, 2: cash, 3: mpesa, 4: complete

  useEffect(() => {
    const cash = parseFloat(cashAmount) || 0;
    const mpesa = parseFloat(mpesaAmount) || 0;
    const totalSplit = cash + mpesa;
    
    if (totalSplit > total) {
      setError('Split amounts exceed total');
    } else if (totalSplit < total && (cashAmount || mpesaAmount)) {
      setError(`Remaining: KES ${(total - totalSplit)?.toFixed(2)}`);
    } else {
      setError('');
    }
  }, [cashAmount, mpesaAmount, total]);

  const handleQuickSplit = (cashPercent) => {
    const cashAmt = (total * cashPercent / 100);
    const mpesaAmt = total - cashAmt;
    setCashAmount(cashAmt?.toFixed(2));
    setMpesaAmount(mpesaAmt?.toFixed(2));
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^254[71][0-9]{8}$/;
    return phoneRegex?.test(phone);
  };

  const handleProceedToPayment = () => {
    const cash = parseFloat(cashAmount) || 0;
    const mpesa = parseFloat(mpesaAmount) || 0;
    
    if (cash + mpesa !== total) {
      setError('Split amounts must equal total');
      return;
    }
    
    if (cash > 0) {
      setStep(2);
    } else if (mpesa > 0) {
      setStep(3);
    }
  };

  const handleCashPayment = () => {
    if (parseFloat(mpesaAmount) > 0) {
      setStep(3);
    } else {
      completePayment({ cashCompleted: true, mpesaCompleted: false });
    }
  };

  const handleMpesaPayment = () => {
    completePayment({ cashCompleted: parseFloat(cashAmount) === 0, mpesaCompleted: true });
  };

  const completePayment = ({ cashCompleted, mpesaCompleted }) => {
    onPaymentComplete({
      method: 'split',
      cashAmount: parseFloat(cashAmount) || 0,
      mpesaAmount: parseFloat(mpesaAmount) || 0,
      phoneNumber: phoneNumber,
      transactionId: 'SPL' + Date.now()?.toString()?.slice(-8),
      timestamp: new Date()?.toISOString(),
      cashCompleted,
      mpesaCompleted
    });
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Split Payment
          </h3>
          <div className="text-lg text-muted-foreground">
            Total Amount: <span className="font-bold text-primary">
              KES {total?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        {/* Quick Split Options */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Quick Split Options
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => handleQuickSplit(50)}
              className="text-sm"
            >
              50/50
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickSplit(70)}
              className="text-sm"
            >
              70/30
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickSplit(30)}
              className="text-sm"
            >
              30/70
            </Button>
          </div>
        </div>
        {/* Manual Split Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cash Amount"
            type="number"
            value={cashAmount}
            onChange={(e) => setCashAmount(e?.target?.value)}
            placeholder="0.00"
            className="text-center"
          />
          <Input
            label="M-Pesa Amount"
            type="number"
            value={mpesaAmount}
            onChange={(e) => setMpesaAmount(e?.target?.value)}
            placeholder="0.00"
            className="text-center"
          />
        </div>
        {/* Split Summary */}
        {(cashAmount || mpesaAmount) && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Cash Payment:</span>
                <span className="font-medium">
                  KES {(parseFloat(cashAmount) || 0)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>M-Pesa Payment:</span>
                <span className="font-medium">
                  KES {(parseFloat(mpesaAmount) || 0)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Split:</span>
                <span>
                  KES {((parseFloat(cashAmount) || 0) + (parseFloat(mpesaAmount) || 0))?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className={`flex items-center p-3 rounded-lg ${
            error?.includes('Remaining') ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
          }`}>
            <Icon 
              name={error?.includes('Remaining') ? 'Info' : 'AlertCircle'} 
              size={16} 
              className={`mr-2 ${error?.includes('Remaining') ? 'text-yellow-600' : 'text-red-600'}`} 
            />
            <span className={`text-sm ${error?.includes('Remaining') ? 'text-yellow-700' : 'text-red-700'}`}>
              {error}
            </span>
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
            onClick={handleProceedToPayment}
            disabled={
              !cashAmount && !mpesaAmount || 
              (parseFloat(cashAmount) || 0) + (parseFloat(mpesaAmount) || 0) !== total ||
              isProcessing
            }
            className="flex-1"
            iconName="ArrowRight"
            iconPosition="right"
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Cash Payment - Step 1
          </h3>
          <div className="text-lg text-muted-foreground">
            Cash Amount: <span className="font-bold text-primary">
              KES {parseFloat(cashAmount)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center text-green-700">
            <Icon name="Banknote" size={16} className="mr-2" />
            <span className="text-sm">
              Collect cash payment of KES {parseFloat(cashAmount)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })} from customer
            </span>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setStep(1)}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            variant="default"
            onClick={handleCashPayment}
            className="flex-1"
            iconName="Check"
            iconPosition="left"
          >
            Cash Received
          </Button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            M-Pesa Payment - {parseFloat(cashAmount) > 0 ? 'Step 2' : 'Step 1'}
          </h3>
          <div className="text-lg text-muted-foreground">
            M-Pesa Amount: <span className="font-bold text-primary">
              KES {parseFloat(mpesaAmount)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <Input
          label="Customer Phone Number"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e?.target?.value)}
          placeholder="254712345678"
          description="Enter phone number for M-Pesa payment"
          className="text-center"
        />
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-blue-700">
            <Icon name="Smartphone" size={16} className="mr-2" />
            <span className="text-sm">
              STK push will be sent for KES {parseFloat(mpesaAmount)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setStep(parseFloat(cashAmount) > 0 ? 2 : 1)}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            variant="default"
            onClick={handleMpesaPayment}
            disabled={!phoneNumber || !validatePhoneNumber(phoneNumber)}
            className="flex-1"
            iconName="Smartphone"
            iconPosition="left"
          >
            Send STK Push
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default SplitPaymentForm;