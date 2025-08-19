import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const MpesaPaymentForm = ({ 
  total, 
  onPaymentComplete, 
  isProcessing, 
  onCancel 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, sending, pending, success, failed
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value?.replace(/\D/g, '');
    
    // Handle different input formats
    if (digits?.startsWith('254')) {
      return digits?.slice(0, 12);
    } else if (digits?.startsWith('0')) {
      return '254' + digits?.slice(1, 10);
    } else if (digits?.startsWith('7') || digits?.startsWith('1')) {
      return '254' + digits?.slice(0, 9);
    }
    
    return digits?.slice(0, 12);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^254[71][0-9]{8}$/;
    return phoneRegex?.test(phone);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e?.target?.value);
    setPhoneNumber(formatted);
    
    if (formatted && !validatePhoneNumber(formatted)) {
      setError('Please enter a valid Kenyan phone number');
    } else {
      setError('');
    }
  };

  const handleSendSTKPush = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    setPaymentStatus('sending');
    setError('');

    try {
      // Mock STK Push - In real implementation, this would call Daraja API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTransactionId = 'MPX' + Date.now()?.toString()?.slice(-8);
      setTransactionId(mockTransactionId);
      setPaymentStatus('pending');
      setCountdown(120); // 2 minutes timeout
      
      // Mock payment confirmation after 10 seconds
      setTimeout(() => {
        if (Math.random() > 0.3) { // 70% success rate
          setPaymentStatus('success');
          onPaymentComplete({
            method: 'mpesa',
            phoneNumber: phoneNumber,
            transactionId: mockTransactionId,
            amount: total,
            timestamp: new Date()?.toISOString()
          });
        } else {
          setPaymentStatus('failed');
          setError('Payment was cancelled or failed. Please try again.');
        }
      }, 10000);
      
    } catch (err) {
      setPaymentStatus('failed');
      setError('Failed to initiate M-Pesa payment. Please try again.');
    }
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setError('');
    setTransactionId('');
    setCountdown(0);
  };

  const formatPhoneDisplay = (phone) => {
    if (phone?.length >= 12) {
      return `+${phone?.slice(0, 3)} ${phone?.slice(3, 6)} ${phone?.slice(6, 9)} ${phone?.slice(9)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          M-Pesa Payment
        </h3>
        <div className="text-lg text-muted-foreground">
          Total Amount: <span className="font-bold text-primary">
            KES {total?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      {/* Safaricom Integration Status */}
      <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200">
        <Icon name="Wifi" size={16} className="text-green-600 mr-2" />
        <span className="text-sm text-green-700 font-medium">
          Safaricom Daraja API Connected
        </span>
      </div>
      {paymentStatus === 'idle' && (
        <>
          {/* Phone Number Input */}
          <div>
            <Input
              label="Customer Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="254712345678"
              description="Enter phone number in format: 254XXXXXXXXX"
              error={error}
              disabled={isProcessing}
              className="text-center text-lg"
            />
            {phoneNumber && (
              <div className="mt-2 text-center text-sm text-muted-foreground">
                Formatted: {formatPhoneDisplay(phoneNumber)}
              </div>
            )}
          </div>

          {/* Quick Number Formats */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Quick Format Examples
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted rounded text-center">
                <div className="font-medium">Safaricom</div>
                <div className="text-muted-foreground">254712345678</div>
              </div>
              <div className="p-2 bg-muted rounded text-center">
                <div className="font-medium">Airtel</div>
                <div className="text-muted-foreground">254732345678</div>
              </div>
            </div>
          </div>

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
              onClick={handleSendSTKPush}
              disabled={!phoneNumber || !validatePhoneNumber(phoneNumber) || isProcessing}
              loading={isProcessing}
              className="flex-1"
              iconName="Smartphone"
              iconPosition="left"
            >
              Send STK Push
            </Button>
          </div>
        </>
      )}
      {paymentStatus === 'sending' && (
        <div className="text-center py-8">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Initiating Payment...
          </h4>
          <p className="text-muted-foreground">
            Connecting to M-Pesa servers
          </p>
        </div>
      )}
      {paymentStatus === 'pending' && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Smartphone" size={32} className="text-blue-600" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Payment Request Sent
          </h4>
          <p className="text-muted-foreground mb-4">
            STK push sent to {formatPhoneDisplay(phoneNumber)}
          </p>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-center justify-center text-blue-700">
              <Icon name="Clock" size={16} className="mr-2" />
              <span className="text-sm">
                Waiting for customer confirmation ({countdown}s remaining)
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Transaction ID: <span className="font-mono">{transactionId}</span>
          </div>
        </div>
      )}
      {paymentStatus === 'success' && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-success mb-2">
            Payment Successful!
          </h4>
          <p className="text-muted-foreground mb-4">
            M-Pesa payment completed successfully
          </p>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm space-y-1">
              <div>Transaction ID: <span className="font-mono">{transactionId}</span></div>
              <div>Phone: {formatPhoneDisplay(phoneNumber)}</div>
              <div>Amount: KES {total?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      )}
      {paymentStatus === 'failed' && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="XCircle" size={32} className="text-red-600" />
          </div>
          <h4 className="text-lg font-semibold text-error mb-2">
            Payment Failed
          </h4>
          <p className="text-muted-foreground mb-4">{error}</p>
          
          <div className="space-y-3">
            <Button
              variant="default"
              onClick={handleRetry}
              className="w-full"
              iconName="RotateCcw"
              iconPosition="left"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Use Different Payment Method
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MpesaPaymentForm;