import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import CashPaymentForm from './components/CashPaymentForm';
import MpesaPaymentForm from './components/MpesaPaymentForm';
import SplitPaymentForm from './components/SplitPaymentForm';
import TransactionSummary from './components/TransactionSummary';
import RefundModal from './components/RefundModal';

const PaymentProcessingAndCheckout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState('method'); // method, payment, summary
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [savedTransaction, setSavedTransaction] = useState(null);

  // Transaction saving utility functions
  const generateTransactionId = () => {
    return 'TXN' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const saveTransaction = (transactionData) => {
    try {
      // Get existing transactions from localStorage
      const existingTransactions = localStorage.getItem('savedTransactions');
      const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
      
      // Add new transaction
      const newTransaction = {
        id: generateTransactionId(),
        ...transactionData,
        savedAt: new Date().toISOString(),
        status: 'completed'
      };
      
      transactions.push(newTransaction);
      
      // Save back to localStorage
      localStorage.setItem('savedTransactions', JSON.stringify(transactions));
      
      // Also save to daily transactions for reporting
      const today = new Date().toISOString().split('T')[0];
      const dailyKey = `transactions_${today}`;
      const dailyTransactions = localStorage.getItem(dailyKey);
      const todayTransactions = dailyTransactions ? JSON.parse(dailyTransactions) : [];
      todayTransactions.push(newTransaction);
      localStorage.setItem(dailyKey, JSON.stringify(todayTransactions));
      
      console.log('Transaction saved:', newTransaction);
      return newTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      return null;
    }
  };

  const saveRefundTransaction = (refundData) => {
    try {
      const existingTransactions = localStorage.getItem('savedTransactions');
      const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
      
      const refundTransaction = {
        id: generateTransactionId(),
        type: 'refund',
        originalOrderId: refundData.originalOrderId,
        refundId: refundData.refundId,
        amount: refundData.amount,
        reason: refundData.reason,
        processedBy: user,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      transactions.push(refundTransaction);
      localStorage.setItem('savedTransactions', JSON.stringify(transactions));
      
      // Also save to daily transactions
      const today = new Date().toISOString().split('T')[0];
      const dailyKey = `transactions_${today}`;
      const dailyTransactions = localStorage.getItem(dailyKey);
      const todayTransactions = dailyTransactions ? JSON.parse(dailyTransactions) : [];
      todayTransactions.push(refundTransaction);
      localStorage.setItem(dailyKey, JSON.stringify(todayTransactions));
      
      console.log('Refund transaction saved:', refundTransaction);
      return refundTransaction;
    } catch (error) {
      console.error('Error saving refund transaction:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get user data (you might want to get this from your auth context instead)
    const mockUser = {
      id: 'CSH001',
      name: 'Sarah Wanjiku',
      email: 'sarah.wanjiku@bobacafe.co.ke',
      role: 'cashier'
    };
    setUser(mockUser);

    // Get real order data from localStorage that was saved in the POS page
    const savedOrderData = localStorage.getItem('currentOrder');
    
    if (savedOrderData) {
      try {
        const parsedOrderData = JSON.parse(savedOrderData);
        
        // Transform the cart items to match the expected format - NO TAX CALCULATION
        const transformedOrderData = {
          orderId: 'ORD' + Date.now().toString().slice(-6),
          items: parsedOrderData.items.map(item => ({
            id: item.id || item.cartId,
            name: item.name,
            size: item.size || 'Regular', // Use size if available, otherwise default
            price: item.price,
            quantity: item.quantity,
            toppings: item.toppings || [] // Add toppings if they exist
          })),
          subtotal: parsedOrderData.total,
          tax: 0, // NO TAX
          total: parsedOrderData.total, // Total equals subtotal (no tax added)
          timestamp: parsedOrderData.timestamp || new Date().toISOString(),
          cashier: parsedOrderData.cashier
        };
        
        setOrderData(transformedOrderData);
      } catch (error) {
        console.error('Error parsing order data:', error);
        // Fallback to redirect if no valid order data
        navigate('/point-of-sale-order-processing');
      }
    } else {
      // No order data found, redirect back to POS
      console.warn('No order data found, redirecting to POS');
      navigate('/point-of-sale-order-processing');
    }
  }, [navigate]);

  const handleLogout = () => {
    setUser(null);
    // Clear any stored order data on logout
    localStorage.removeItem('currentOrder');
    navigate('/staff-login-and-authentication');
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = (paymentDetails) => {
    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      const completePaymentData = {
        ...paymentDetails,
        orderId: orderData?.orderId,
        tipAmount: tipAmount,
        timestamp: new Date().toISOString()
      };

      setPaymentData(completePaymentData);

      // Create comprehensive transaction data for saving
      const transactionData = {
        type: 'sale',
        orderId: orderData?.orderId,
        items: orderData?.items,
        subtotal: orderData?.subtotal,
        tax: orderData?.tax,
        tipAmount: tipAmount,
        total: orderData?.total + tipAmount,
        paymentMethod: paymentDetails.method,
        paymentDetails: paymentDetails,
        cashier: orderData?.cashier,
        customer: paymentDetails.customerInfo || null,
        timestamp: completePaymentData.timestamp,
        orderTimestamp: orderData?.timestamp,
        location: 'Main Store', // You can make this dynamic
        terminal: 'POS-001' // You can make this dynamic
      };

      // Save the transaction
      const savedTxn = saveTransaction(transactionData);
      setSavedTransaction(savedTxn);

      setCurrentStep('summary');
      setIsProcessing(false);
      
      // Clear the current order from localStorage after successful payment
      localStorage.removeItem('currentOrder');
    }, 1500);
  };

  const handleBackToMethod = () => {
    setCurrentStep('method');
    setSelectedPaymentMethod('');
  };

  const handlePrintReceipt = () => {
    // Mock receipt printing - Updated to remove tax line and include transaction ID
    const receiptWindow = window.open('', '_blank');
    receiptWindow?.document?.write(`
      <html>
        <head>
          <title>Receipt - ${orderData?.orderId}</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Boba Cafe POS System</h2>
            <p>Receipt #${orderData?.orderId}</p>
            <p>Transaction ID: ${savedTransaction?.id || 'N/A'}</p>
            <p>${new Date(paymentData.timestamp)?.toLocaleString('en-KE')}</p>
            <p>Cashier: ${orderData?.cashier?.name || 'N/A'}</p>
          </div>
          ${orderData?.items?.map(item => `
            <div class="item">
              <span>${item?.name} ${item?.size ? `(${item?.size})` : ''} x${item?.quantity}</span>
              <span>KES ${(item?.price * item?.quantity)?.toFixed(2)}</span>
            </div>
          `)?.join('')}
          ${tipAmount > 0 ? `
            <div class="item">
              <span>Tip:</span>
              <span>KES ${tipAmount?.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total">
            <div class="item">
              <span>Total:</span>
              <span>KES ${(orderData?.total + tipAmount)?.toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Payment:</span>
              <span>${paymentData?.method?.toUpperCase()}</span>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <p>Thank you for your business!</p>
            <p>Visit us again!</p>
            <p>Transaction saved: ${savedTransaction?.id || 'Error'}</p>
          </div>
        </body>
      </html>
    `);
    receiptWindow?.document?.close();
    receiptWindow?.print();
  };

  const handleEmailReceipt = () => {
    // Mock email receipt with transaction data
    const emailData = {
      transactionId: savedTransaction?.id,
      orderId: orderData?.orderId,
      total: orderData?.total + tipAmount,
      timestamp: paymentData?.timestamp
    };
    alert(`Receipt sent to customer email (mock functionality)\nTransaction ID: ${emailData.transactionId}`);
  };

  const handleSMSReceipt = () => {
    // Mock SMS receipt with transaction data
    const smsData = {
      transactionId: savedTransaction?.id,
      total: orderData?.total + tipAmount
    };
    alert(`Receipt sent via SMS (mock functionality)\nTransaction ID: ${smsData.transactionId}\nAmount: KES ${smsData.total.toFixed(2)}`);
  };

  const handleNewOrder = () => {
    // Clear any remaining order data and go to new order
    localStorage.removeItem('currentOrder');
    // Reset all states for new order
    setOrderData(null);
    setPaymentData(null);
    setSavedTransaction(null);
    setSelectedPaymentMethod('');
    setCurrentStep('method');
    setTipAmount(0);
    navigate('/point-of-sale-order-processing');
  };

  const handleCloseTransaction = () => {
    // Clear any remaining order data and go back to POS
    localStorage.removeItem('currentOrder');
    navigate('/point-of-sale-order-processing');
  };

  const handleRefundComplete = (refundData) => {
    // Save refund transaction
    const refundTransaction = saveRefundTransaction({
      ...refundData,
      originalOrderId: orderData?.orderId
    });

    alert(`Refund processed: ${refundData?.refundId}\nAmount: KES ${refundData?.amount?.toFixed(2)}\nTransaction ID: ${refundTransaction?.id || 'Error'}`);
    setShowRefundModal(false);
  };

  // Add function to view all transactions (for debugging/admin)
  const viewAllTransactions = () => {
    const transactions = localStorage.getItem('savedTransactions');
    if (transactions) {
      console.log('All Saved Transactions:', JSON.parse(transactions));
    } else {
      console.log('No transactions found');
    }
  };

  // Add function to export transactions
  const exportTransactions = () => {
    const transactions = localStorage.getItem('savedTransactions');
    if (transactions) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(transactions);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  // Loading state while order data is being processed
  if (!user || !orderData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-muted-foreground">Loading order data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Payment Processing & Checkout
                </h1>
                <p className="text-muted-foreground">
                  Order #{orderData?.orderId} • {orderData?.items?.length} items • Total: KES {(orderData?.total + tipAmount)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  {savedTransaction && (
                    <span className="ml-4 text-success">• Transaction ID: {savedTransaction.id}</span>
                  )}
                </p>
              </div>
              
              <div className="flex gap-2">
                {currentStep === 'summary' && user?.role === 'manager' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRefundModal(true)}
                    iconName="RefreshCw"
                    iconPosition="left"
                    className="touch-feedback"
                  >
                    Process Refund
                  </Button>
                )}
                {/* Debug buttons - you can remove these in production */}
                {user?.role === 'manager' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={viewAllTransactions}
                      className="text-xs"
                    >
                      View Transactions (Console)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportTransactions}
                      className="text-xs"
                    >
                      Export Data
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${
                  currentStep === 'method' ? 'text-primary' : 
                  currentStep === 'payment' || currentStep === 'summary' ? 'text-success' : 'text-muted-foreground'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep === 'method' ? 'border-primary bg-primary text-white' :
                    currentStep === 'payment'|| currentStep === 'summary' ? 'border-success bg-success text-white' : 'border-muted-foreground'
                  }`}>
                    {currentStep === 'payment' || currentStep === 'summary' ? (
                      <Icon name="Check" size={16} />
                    ) : (
                      '1'
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">Payment Method</span>
                </div>
                
                <div className={`w-8 h-0.5 ${
                  currentStep === 'payment' || currentStep === 'summary' ? 'bg-success' : 'bg-muted'
                }`} />
                
                <div className={`flex items-center ${
                  currentStep === 'payment' ? 'text-primary' :
                  currentStep === 'summary' ? 'text-success' : 'text-muted-foreground'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep === 'payment' ? 'border-primary bg-primary text-white' :
                    currentStep === 'summary'? 'border-success bg-success text-white' : 'border-muted-foreground'
                  }`}>
                    {currentStep === 'summary' ? (
                      <Icon name="Check" size={16} />
                    ) : (
                      '2'
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">Process Payment</span>
                </div>
                
                <div className={`w-8 h-0.5 ${
                  currentStep === 'summary' ? 'bg-success' : 'bg-muted'
                }`} />
                
                <div className={`flex items-center ${
                  currentStep === 'summary' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep === 'summary' ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">Complete</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Summary Sidebar - Updated to remove tax display */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Icon name="ShoppingBag" size={20} className="mr-2" />
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    {orderData?.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item?.name}</div>
                          {item?.size && item?.size !== 'Regular' && (
                            <div className="text-muted-foreground text-xs">Size: {item?.size}</div>
                          )}
                          {item?.toppings && item?.toppings?.length > 0 && (
                            <div className="text-muted-foreground text-xs">
                              {item?.toppings?.join(', ')}
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
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Subtotal:</span>
                      <span>KES {orderData?.subtotal?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {/* Tax line removed */}
                    {tipAmount > 0 && (
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tip:</span>
                        <span>KES {tipAmount?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-primary">
                      <span>Total:</span>
                      <span>KES {(orderData?.total + tipAmount)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  
                  {/* Cashier Info */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      <p>Cashier: {orderData?.cashier?.name}</p>
                      <p>Time: {new Date(orderData?.timestamp)?.toLocaleString('en-KE')}</p>
                      {savedTransaction && (
                        <p className="text-success">Txn ID: {savedTransaction.id}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Payment Area */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-lg p-6">
                  {currentStep === 'method' && (
                    <PaymentMethodSelector
                      selectedMethod={selectedPaymentMethod}
                      onMethodSelect={handlePaymentMethodSelect}
                      total={orderData?.total + tipAmount}
                      isProcessing={isProcessing}
                    />
                  )}

                  {currentStep === 'payment' && selectedPaymentMethod === 'cash' && (
                    <CashPaymentForm
                      total={orderData?.total + tipAmount}
                      onPaymentComplete={handlePaymentComplete}
                      isProcessing={isProcessing}
                      onCancel={handleBackToMethod}
                    />
                  )}

                  {currentStep === 'payment' && selectedPaymentMethod === 'mpesa' && (
                    <MpesaPaymentForm
                      total={orderData?.total + tipAmount}
                      onPaymentComplete={handlePaymentComplete}
                      isProcessing={isProcessing}
                      onCancel={handleBackToMethod}
                    />
                  )}

                  {currentStep === 'payment' && selectedPaymentMethod === 'split' && (
                    <SplitPaymentForm
                      total={orderData?.total + tipAmount}
                      onPaymentComplete={handlePaymentComplete}
                      isProcessing={isProcessing}
                      onCancel={handleBackToMethod}
                    />
                  )}

                  {currentStep === 'summary' && paymentData && (
                    <TransactionSummary
                      orderData={orderData}
                      paymentData={paymentData}
                      transactionData={savedTransaction}
                      onPrintReceipt={handlePrintReceipt}
                      onEmailReceipt={handleEmailReceipt}
                      onSMSReceipt={handleSMSReceipt}
                      onNewOrder={handleNewOrder}
                      onClose={handleCloseTransaction}
                      user={user}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Refund Modal */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        orderData={{
          ...orderData,
          paymentMethod: paymentData?.method
        }}
        onRefundComplete={handleRefundComplete}
        user={user}
      />
    </div>
  );
};

export default PaymentProcessingAndCheckout;