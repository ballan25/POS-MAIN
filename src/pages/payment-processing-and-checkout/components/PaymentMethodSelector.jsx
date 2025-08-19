import React from 'react';

import Icon from '../../../components/AppIcon';

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodSelect, 
  total, 
  isProcessing 
}) => {
  const paymentMethods = [
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: 'Banknote',
      description: 'Accept cash payment with change calculation',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: 'Smartphone',
      description: 'Mobile money payment via Safaricom',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Select Payment Method
        </h3>
        <div className="text-2xl font-bold text-primary">
          Total: KES {total?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods?.map((method) => (
          <button
            key={method?.id}
            onClick={() => onMethodSelect(method?.id)}
            disabled={isProcessing}
            className={`p-6 rounded-lg border-2 transition-all duration-200 touch-feedback ${
              selectedMethod === method?.id
                ? 'border-primary bg-primary/10 shadow-md'
                : method?.color
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedMethod === method?.id ? 'bg-primary' : 'bg-white'
              }`}>
                <Icon 
                  name={method?.icon} 
                  size={32} 
                  className={selectedMethod === method?.id ? 'text-white' : method?.iconColor}
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-1">
                  {method?.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {method?.description}
                </p>
              </div>
              {selectedMethod === method?.id && (
                <div className="flex items-center text-primary">
                  <Icon name="CheckCircle" size={20} className="mr-2" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      {selectedMethod && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center text-success">
            <Icon name="Info" size={16} className="mr-2" />
            <span className="text-sm">
              {selectedMethod === 'cash' ?'Cash payment selected. Enter amount received below.' :'M-Pesa payment selected. Enter customer phone number below.'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;