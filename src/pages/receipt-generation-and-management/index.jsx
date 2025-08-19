import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ReceiptSidebar from './components/ReceiptSidebar';
import ReceiptPreview from './components/ReceiptPreview';
import PrintQueue from './components/PrintQueue';
import ReceiptTemplates from './components/ReceiptTemplates';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ReceiptGenerationAndManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [printQueue, setPrintQueue] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [showPrintQueue, setShowPrintQueue] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data - check localStorage for authentication
  useEffect(() => {
    const savedUser = localStorage.getItem('bobaPosUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate('/staff-login-and-authentication');
      return;
    }

    // Load mock receipts data
    loadMockReceipts();
  }, [navigate]);

  const loadMockReceipts = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockReceipts = [
        {
          id: 'RCP001',
          orderNumber: 'ORD-2025-001',
          date: '2025-01-07T09:15:00',
          cashier: 'Sarah Johnson',
          customerPhone: '+254712345678',
          paymentMethod: 'mpesa',
          mpesaCode: 'QHX7Y8Z9',
          items: [
            {
              name: 'Large Taro Bubble Tea',
              size: 'Large',
              quantity: 1,
              unitPrice: 450,
              total: 450,
              toppings: ['Tapioca Pearls', 'Extra Ice']
            },
            {
              name: 'Medium Thai Tea',
              size: 'Medium',
              quantity: 2,
              unitPrice: 350,
              total: 700,
              toppings: ['Coconut Jelly']
            }
          ],
          subtotal: 1150,
          tax: 184,
          discount: 0,
          total: 1334,
          amountPaid: 1334,
          change: 0,
          status: 'printed'
        },
        {
          id: 'RCP002',
          orderNumber: 'ORD-2025-002',
          date: '2025-01-07T09:45:00',
          cashier: 'Michael Chen',
          customerPhone: null,
          paymentMethod: 'cash',
          mpesaCode: null,
          items: [
            {
              name: 'Small Matcha Latte',
              size: 'Small',
              quantity: 1,
              unitPrice: 280,
              total: 280,
              toppings: ['Whipped Cream']
            },
            {
              name: 'Chocolate Muffin',
              size: null,
              quantity: 1,
              unitPrice: 150,
              total: 150,
              toppings: []
            }
          ],
          subtotal: 430,
          tax: 68.8,
          discount: 43,
          total: 455.8,
          amountPaid: 500,
          change: 44.2,
          status: 'pending'
        },
        {
          id: 'RCP003',
          orderNumber: 'ORD-2025-003',
          date: '2025-01-07T10:20:00',
          cashier: 'Sarah Johnson',
          customerPhone: '+254798765432',
          paymentMethod: 'mpesa',
          mpesaCode: 'QJK3L4M5',
          items: [
            {
              name: 'Large Brown Sugar Milk Tea',
              size: 'Large',
              quantity: 1,
              unitPrice: 420,
              total: 420,
              toppings: ['Brown Sugar Pearls', 'Extra Milk']
            },
            {
              name: 'Medium Passion Fruit Tea',
              size: 'Medium',
              quantity: 1,
              unitPrice: 320,
              total: 320,
              toppings: ['Passion Fruit Bits']
            }
          ],
          subtotal: 740,
          tax: 118.4,
          discount: 0,
          total: 858.4,
          amountPaid: 858.4,
          change: 0,
          status: 'printed'
        },
        {
          id: 'RCP004',
          orderNumber: 'ORD-2025-004',
          date: '2025-01-07T11:00:00',
          cashier: 'Michael Chen',
          customerPhone: null,
          paymentMethod: 'cash',
          mpesaCode: null,
          items: [
            {
              name: 'Medium Honeydew Smoothie',
              size: 'Medium',
              quantity: 2,
              unitPrice: 380,
              total: 760,
              toppings: ['Coconut Flakes']
            }
          ],
          subtotal: 760,
          tax: 121.6,
          discount: 76,
          total: 805.6,
          amountPaid: 850,
          change: 44.4,
          status: 'failed'
        },
        {
          id: 'RCP005',
          orderNumber: 'ORD-2025-005',
          date: '2025-01-07T11:30:00',
          cashier: 'Sarah Johnson',
          customerPhone: '+254723456789',
          paymentMethod: 'mpesa',
          mpesaCode: 'QNP6Q7R8',
          items: [
            {
              name: 'Large Classic Milk Tea',
              size: 'Large',
              quantity: 1,
              unitPrice: 400,
              total: 400,
              toppings: ['Tapioca Pearls']
            },
            {
              name: 'Small Lemon Green Tea',
              size: 'Small',
              quantity: 1,
              unitPrice: 250,
              total: 250,
              toppings: ['Fresh Lemon']
            },
            {
              name: 'Blueberry Cheesecake',
              size: null,
              quantity: 1,
              unitPrice: 200,
              total: 200,
              toppings: []
            }
          ],
          subtotal: 850,
          tax: 136,
          discount: 0,
          total: 986,
          amountPaid: 986,
          change: 0,
          status: 'printed'
        }
      ];

      setReceipts(mockReceipts);
      setSelectedReceipt(mockReceipts?.[0]);
      
      // Mock print queue
      setPrintQueue([
        {
          id: 'PQ001',
          orderNumber: 'ORD-2025-002',
          status: 'pending',
          timestamp: new Date(Date.now() - 300000)
        },
        {
          id: 'PQ002',
          orderNumber: 'ORD-2025-004',
          status: 'failed',
          error: 'Printer offline',
          timestamp: new Date(Date.now() - 600000)
        },
        {
          id: 'PQ003',
          orderNumber: 'ORD-2025-001',
          status: 'completed',
          timestamp: new Date(Date.now() - 900000)
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('bobaPosUser');
    setUser(null);
  };

  const handleSelectReceipt = (receipt) => {
    setSelectedReceipt(receipt);
  };

  const handlePrintReceipt = () => {
    if (!selectedReceipt) return;

    // Add to print queue
    const printJob = {
      id: `PQ${Date.now()}`,
      orderNumber: selectedReceipt?.orderNumber,
      status: 'pending',
      timestamp: new Date()
    };

    setPrintQueue(prev => [printJob, ...prev]);

    // Simulate print process
    setTimeout(() => {
      setPrintQueue(prev => 
        prev?.map(job => 
          job?.id === printJob?.id 
            ? { ...job, status: 'printing' }
            : job
        )
      );

      setTimeout(() => {
        setPrintQueue(prev => 
          prev?.map(job => 
            job?.id === printJob?.id 
              ? { ...job, status: 'completed' }
              : job
          )
        );

        // Update receipt status
        setReceipts(prev => 
          prev?.map(receipt => 
            receipt?.id === selectedReceipt?.id 
              ? { ...receipt, status: 'printed' }
              : receipt
          )
        );
      }, 2000);
    }, 1000);

    // Trigger browser print
    window.print();
  };

  const handleDownloadReceipt = () => {
    if (!selectedReceipt) return;

    // Create a simple text receipt for download
    const receiptText = `
BOBA BLISS CAFÉ
Premium Bubble Tea & Refreshments
Westlands, Nairobi | Tel: +254 700 123 456

Order #: ${selectedReceipt?.orderNumber}
Date: ${new Date(selectedReceipt.date)?.toLocaleString('en-GB')}
Cashier: ${selectedReceipt?.cashier}
${selectedReceipt?.customerPhone ? `Customer: ${selectedReceipt?.customerPhone}` : ''}

ORDER ITEMS:
${selectedReceipt?.items?.map(item => 
  `${item?.name} ${item?.size ? `(${item?.size})` : ''} x${item?.quantity} - KES ${item?.total?.toFixed(2)}
  ${item?.toppings?.length > 0 ? `  Add-ons: ${item?.toppings?.join(', ')}` : ''}`
)?.join('\n')}

Subtotal: KES ${selectedReceipt?.subtotal?.toFixed(2)}
${selectedReceipt?.tax > 0 ? `Tax (16%): KES ${selectedReceipt?.tax?.toFixed(2)}` : ''}
${selectedReceipt?.discount > 0 ? `Discount: -KES ${selectedReceipt?.discount?.toFixed(2)}` : ''}
TOTAL: KES ${selectedReceipt?.total?.toFixed(2)}

Payment Method: ${selectedReceipt?.paymentMethod?.toUpperCase()}
Amount Paid: KES ${selectedReceipt?.amountPaid?.toFixed(2)}
${selectedReceipt?.change > 0 ? `Change: KES ${selectedReceipt?.change?.toFixed(2)}` : ''}
${selectedReceipt?.mpesaCode ? `M-Pesa Code: ${selectedReceipt?.mpesaCode}` : ''}

Thank you for choosing Boba Bliss Café!
Follow us @BobaBlisCafe for updates & offers
Visit again soon for more delicious bubble tea!
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${selectedReceipt?.orderNumber}.txt`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBulkPrint = (receiptIds) => {
    receiptIds?.forEach(id => {
      const receipt = receipts?.find(r => r?.id === id);
      if (receipt) {
        const printJob = {
          id: `PQ${Date.now()}-${id}`,
          orderNumber: receipt?.orderNumber,
          status: 'pending',
          timestamp: new Date()
        };
        setPrintQueue(prev => [printJob, ...prev]);
      }
    });

    // Simulate bulk printing
    setTimeout(() => {
      setPrintQueue(prev => 
        prev?.map(job => ({ ...job, status: 'completed' }))
      );
    }, 3000);
  };

  const handleRetryPrint = (jobId) => {
    setPrintQueue(prev => 
      prev?.map(job => 
        job?.id === jobId 
          ? { ...job, status: 'pending', error: null }
          : job
      )
    );

    setTimeout(() => {
      setPrintQueue(prev => 
        prev?.map(job => 
          job?.id === jobId 
            ? { ...job, status: 'completed' }
            : job
        )
      );
    }, 2000);
  };

  const handleRemoveFromQueue = (jobId) => {
    setPrintQueue(prev => prev?.filter(job => job?.id !== jobId));
  };

  const handleClearQueue = () => {
    setPrintQueue([]);
  };

  const handleSaveTemplate = (templateId, customization) => {
    setSelectedTemplate(templateId);
    // In a real app, save to backend
    console.log('Template saved:', templateId, customization);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={handleLogout} />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Icon name="Loader2" size={32} className="text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading receipts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      <main className="pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Receipt" size={20} className="text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Receipt Management</h1>
                  <p className="text-muted-foreground">Generate, print, and manage transaction receipts</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(!showTemplates)}
                  iconName="Layout"
                  iconPosition="left"
                  iconSize={16}
                  className="touch-feedback"
                >
                  Templates
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPrintQueue(!showPrintQueue)}
                  iconName="Printer"
                  iconPosition="left"
                  iconSize={16}
                  className="touch-feedback"
                >
                  Print Queue ({printQueue?.length})
                </Button>
                <Button
                  variant="default"
                  onClick={loadMockReceipts}
                  iconName="RefreshCw"
                  iconPosition="left"
                  iconSize={16}
                  className="touch-feedback"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex space-x-6 h-[calc(100vh-200px)]">
            <ReceiptSidebar
              receipts={receipts}
              selectedReceipt={selectedReceipt}
              onSelectReceipt={handleSelectReceipt}
              onBulkPrint={handleBulkPrint}
              onRefresh={loadMockReceipts}
              user={user}
            />
            
            <ReceiptPreview
              selectedReceipt={selectedReceipt}
              onPrint={handlePrintReceipt}
              onDownload={handleDownloadReceipt}
              onClose={() => setSelectedReceipt(null)}
            />
          </div>
        </div>
      </main>
      {/* Floating Components */}
      <PrintQueue
        printQueue={printQueue}
        onRetryPrint={handleRetryPrint}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
        isVisible={showPrintQueue}
        onToggle={() => setShowPrintQueue(!showPrintQueue)}
      />
      <ReceiptTemplates
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        onSaveTemplate={handleSaveTemplate}
        isVisible={showTemplates}
        onToggle={() => setShowTemplates(!showTemplates)}
        user={user}
      />
      {/* Keyboard Shortcuts Info */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg px-4 py-2 shadow-elevation-1 z-40">
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">P</kbd>
            <span>Print</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
            <span>Close Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerationAndManagement;