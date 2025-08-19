import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const TransactionSummary = ({ 
  orderData, 
  paymentData, 
  onPrintReceipt, 
  onEmailReceipt, 
  onSMSReceipt, 
  onNewOrder, 
  onClose,
  user 
}) => {
  const formatDateTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleString('en-KE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getPaymentMethodDisplay = () => {
    switch (paymentData?.method) {
      case 'cash':
        return {
          icon: 'Banknote',
          name: 'Cash Payment',
          details: [
            `Amount Received: KES ${paymentData?.amountReceived?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
            `Change Given: KES ${paymentData?.change?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
          ]
        };
      case 'mpesa':
        return {
          icon: 'Smartphone',
          name: 'M-Pesa Payment',
          details: [
            `Phone Number: ${paymentData?.phoneNumber}`,
            `Transaction ID: ${paymentData?.transactionId}`
          ]
        };
      case 'split':
        return {
          icon: 'CreditCard',
          name: 'Split Payment',
          details: [
            `Cash: KES ${paymentData?.cashAmount?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
            `M-Pesa: KES ${paymentData?.mpesaAmount?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
            paymentData?.phoneNumber && `Phone: ${paymentData?.phoneNumber}`,
            paymentData?.transactionId && `Transaction ID: ${paymentData?.transactionId}`
          ]?.filter(Boolean)
        };
      default:
        return { icon: 'CreditCard', name: 'Payment', details: [] };
    }
  };

  const paymentMethod = getPaymentMethodDisplay();

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle" size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-success mb-2">
          Payment Successful!
        </h2>
        <p className="text-muted-foreground">
          Transaction completed successfully
        </p>
      </div>
      {/* Order Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="ShoppingBag" size={20} className="mr-2" />
          Order Summary
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-mono font-medium">{orderData?.orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date & Time:</span>
            <span>{formatDateTime(paymentData?.timestamp)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cashier:</span>
            <span>{user?.name || user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items:</span>
            <span>{orderData?.items?.length || 0} item(s)</span>
          </div>
        </div>

        {/* Items List */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="space-y-2">
            {orderData?.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex-1">
                  <div className="font-medium">{item?.name}</div>
                  {item?.size && (
                    <div className="text-muted-foreground text-xs">Size: {item?.size}</div>
                  )}
                  {item?.toppings && item?.toppings?.length > 0 && (
                    <div className="text-muted-foreground text-xs">
                      Toppings: {item?.toppings?.join(', ')}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div>x{item?.quantity}</div>
                  <div className="font-medium">
                    KES {(item?.price * item?.quantity)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">
                KES {orderData?.total?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Details */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name={paymentMethod?.icon} size={20} className="mr-2" />
          Payment Details
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="font-medium">{paymentMethod?.name}</span>
          </div>
          {paymentMethod?.details?.map((detail, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{detail?.split(':')?.[0]}:</span>
              <span>{detail?.split(':')?.[1]}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="text-success font-medium flex items-center">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Completed
            </span>
          </div>
        </div>
      </div>
      {/* Receipt Options */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Receipt Options
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrintReceipt}
            iconName="Printer"
            iconPosition="left"
            className="touch-feedback"
          >
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEmailReceipt}
            iconName="Mail"
            iconPosition="left"
            className="touch-feedback"
          >
            Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSMSReceipt}
            iconName="MessageSquare"
            iconPosition="left"
            className="touch-feedback"
          >
            SMS
          </Button>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Close
        </Button>
        <Button
          variant="default"
          onClick={onNewOrder}
          className="flex-1"
          iconName="Plus"
          iconPosition="left"
        >
          New Order
        </Button>
      </div>
    </div>
  );
};

export default TransactionSummary;