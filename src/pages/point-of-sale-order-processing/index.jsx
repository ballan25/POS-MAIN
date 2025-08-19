import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import SizeSelectionModal from './components/SizeSelectionModal';
import StatusIndicators from './components/StatusIndicators';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PointOfSaleOrderProcessing = () => {
  const navigate = useNavigate();
  const [currentUser] = useState({
    id: 'CSH001',
    name: 'Sarah Wanjiku',
    email: 'sarah.wanjiku@bobacafe.co.ke',
    role: 'cashier'
  });

  const [categories] = useState([
    { id: 'fruit-teas', name: 'Fruit Teas' },
    { id: 'milk-teas', name: 'Milk Teas' },
    { id: 'cake-milk-teas', name: 'Cake Milk Teas (Smoothies)' },
    { id: 'milkshakes', name: 'Milkshakes' },
    { id: 'mojitos-mocktails', name: 'Mojitos & Mocktails' },
    { id: 'boba-jellies', name: 'Boba & Jellies' }
  ]);

  const [products] = useState([
    // Fruit Teas - Added pricing
    { id: 'fruit-001', name: 'Lemon fruit tea', category: 'fruit-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'fruit-002', name: 'Blueberry fruit tea', category: 'fruit-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'fruit-003', name: 'Peach fruit tea', category: 'fruit-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'fruit-004', name: 'Raspberry fruit tea', category: 'fruit-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'fruit-005', name: 'Lychee fruit tea', category: 'fruit-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'fruit-006', name: 'Strawberry fruit tea', category: 'fruit-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'fruit-007', name: 'Green fruit tea', category: 'fruit-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'fruit-008', name: 'Honeydew fruit tea', category: 'fruit-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},

    // Milk Teas - Added pricing
    { id: 'milk-001', name: 'Taro milk tea', category: 'milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'milk-002', name: 'Hazelnut milk tea', category: 'milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'milk-003', name: 'Vanilla milk tea', category: 'milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'milk-004', name: 'Chocolate milk tea', category: 'milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'milk-005', name: 'Lavender milk tea', category: 'milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'milk-006', name: 'Mocha milk tea', category: 'milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'milk-007', name: 'Papaya milk tea', category: 'milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'milk-008', name: 'Lotus milk tea', category: 'milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},

    // Cake Milk Teas (Smoothies) - Prices unchanged
    { id: 'cake-001', name: 'Strawberry cake milk tea', category: 'cake-milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'cake-002', name: 'Pineapple smoothie boba', category: 'cake-milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'cake-003', name: 'Tiger milk tea', category: 'cake-milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'cake-004', name: 'Passion smoothie boba', category: 'cake-milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'cake-005', name: 'Winter melon milk tea', category: 'cake-milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'cake-006', name: 'Strawberry smoothie boba', category: 'cake-milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'cake-007', name: 'Matcha cake milk tea', category: 'cake-milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'cake-008', name: 'Taro cake milk tea', category: 'cake-milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},

    // Milkshakes - Prices unchanged
    { id: 'shake-001', name: 'Vanilla milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-002', name: 'Blueberry milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-003', name: 'Vanilla boba milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-004', name: 'Blueberry boba milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-005', name: 'Chocolate milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-006', name: 'Oreo boba milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-007', name: 'Passion boba milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-008', name: 'Mango milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-009', name: 'Lychee jelly milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-010', name: 'Blueberry jelly milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-011', name: 'Pineapple jelly milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-012', name: 'Raspberry jelly milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'shake-013', name: 'Coffee jelly milkshake', category: 'milkshakes', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},

    // Mojitos & Mocktails - Prices unchanged
    { id: 'mojito-001', name: 'Peach fruit mojito boba', category: 'mojitos-mocktails', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'mojito-002', name: 'Mango boba milkshake', category: 'mojitos-mocktails', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'mojito-003', name: 'Raspberry boba milkshake', category: 'mojitos-mocktails', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'mojito-004', name: 'Lemon fruit mojito boba', category: 'mojitos-mocktails', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'mojito-005', name: 'Vanilla boba lemonade boba', category: 'mojitos-mocktails', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'mojito-006', name: 'Blueberry boba lemonade boba', category: 'mojitos-mocktails', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'mojito-007', name: 'Passion latte boba', category: 'mojitos-mocktails', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'mojito-008', name: 'Strawberry ade boba', category: 'mojitos-mocktails', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'mojito-009', name: 'Pomegranate boba', category: 'mojitos-mocktails', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},
    { id: 'mojito-010', name: 'Blue Lagoon mocktail', category: 'mojitos-mocktails', sizes: [
      { id: 'medium', name: 'Medium', price: 500 },
      { id: 'large', name: 'Large', price: 600 }
    ]},

    // Boba & Jellies - Added pricing
    { id: 'boba-001', name: 'Mango boba', category: 'boba-jellies', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'boba-002', name: 'Passion boba', category: 'boba-jellies', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'boba-003', name: 'Kiwi boba', category: 'boba-jellies', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'boba-004', name: 'Blueberry boba', category: 'boba-jellies', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'boba-005', name: 'Pomegranate boba', category: 'boba-jellies', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]}
  ]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    mpesa: 'connected',
    firestore: 'connected',
    lastSync: new Date()?.toISOString()
  });

  const [recentOrders] = useState([]);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products?.filter(product => product?.category === activeCategory);

  const cartTotal = cartItems?.reduce((total, item) => total + (item?.price * item?.quantity), 0);

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  const handleAddToCart = useCallback((product) => {
    const cartId = `${product?.id}-${Date.now()}-${Math.random()}`;
    const newItem = {
      ...product,
      cartId,
      quantity: 1
    };
    setCartItems(prev => [...prev, newItem]);
  }, []);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    setShowSizeModal(true);
  }, []);

  const handleUpdateQuantity = useCallback((cartId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev?.filter(item => item?.cartId !== cartId));
    } else {
      setCartItems(prev => prev?.map(item => 
        item?.cartId === cartId ? { ...item, quantity: newQuantity } : item
      ));
    }
  }, []);

  const handleRemoveItem = useCallback((cartId) => {
    setCartItems(prev => prev?.filter(item => item?.cartId !== cartId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const handleProceedToPayment = useCallback(() => {
    if (cartItems?.length === 0) return;
    const orderData = {
      items: cartItems,
      total: cartTotal,
      tax: cartTotal * 0.16,
      grandTotal: cartTotal * 1.16,
      cashier: currentUser,
      timestamp: new Date()?.toISOString()
    };
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    navigate('/payment-processing-and-checkout');
  }, [cartItems, cartTotal, currentUser, navigate]);

  const handleQuickReorder = useCallback((order) => {
    console.log('Quick reorder:', order);
  }, []);

  const handleBarcodeMode = useCallback(() => {
    setBarcodeMode(prev => !prev);
  }, []);

  const handleCustomerPreferences = useCallback(() => {
    console.log('Opening customer preferences');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('currentUser');
    navigate('/staff-login-and-authentication');
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastSync: new Date()?.toISOString()
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault();
            setBarcodeMode(prev => !prev);
            break;
          case 'c':
            event.preventDefault();
            setCartItems([]);
            break;
          case 'p':
            event.preventDefault();
            if (cartItems?.length > 0) {
              handleProceedToPayment();
            }
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cartItems, handleProceedToPayment]);

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} onLogout={handleLogout} />
      <div className="pt-16 h-screen flex">
        {/* Left Panel - Product Grid (now wider) */}
        <div className="w-full lg:w-3/4 flex flex-col">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
          <ProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            onProductSelect={handleProductSelect}
          />
        </div>
        {/* Right Panel - System Status + Current Order */}
        <div className="hidden lg:flex lg:w-1/4 flex-col gap-4 px-2">
          <div className="mb-2">
            <StatusIndicators
              mpesaStatus={systemStatus?.mpesa}
              firestoreStatus={systemStatus?.firestore}
              lastSync={systemStatus?.lastSync}
            />
          </div>
          <div className="mb-2">
            <QuickActions
              onQuickReorder={handleQuickReorder}
              onBarcodeMode={handleBarcodeMode}
              onCustomerPreferences={handleCustomerPreferences}
              recentOrders={recentOrders}
              barcodeMode={barcodeMode}
            />
          </div>
          <CartPanel
            cartItems={cartItems}
            cartTotal={cartTotal}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onProceedToPayment={handleProceedToPayment}
            currentUser={currentUser}
          />
        </div>
      </div>
      {/* Size Selection Modal */}
      <SizeSelectionModal
        product={selectedProduct}
        isOpen={showSizeModal}
        onClose={() => {
          setShowSizeModal(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />
      {/* Barcode Scanner Overlay */}
      {barcodeMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-custom z-40 flex items-center justify-center">
          <div className="bg-card rounded-lg p-8 text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Scan" size={32} className="text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Barcode Scanner Active
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Scan product barcode or press Escape to exit
            </p>
            <Button
              variant="outline"
              onClick={() => setBarcodeMode(false)}
              iconName="X"
              iconPosition="left"
              iconSize={16}
            >
              Exit Scanner
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSaleOrderProcessing;

