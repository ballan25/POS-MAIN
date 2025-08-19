import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SizeSelectionModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const formatPrice = (price) => {
    return `KES ${price?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const handleToppingToggle = (topping) => {
    setSelectedToppings(prev => {
      const exists = prev?.find(t => t?.id === topping?.id);
      if (exists) {
        return prev?.filter(t => t?.id !== topping?.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const getTotalPrice = () => {
    const sizePrice = selectedSize ? selectedSize?.price : 0;
    const toppingsPrice = selectedToppings?.reduce((total, topping) => total + topping?.price, 0);
    return sizePrice + toppingsPrice;
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;

    const cartItem = {
      ...product,
      size: selectedSize?.name,
      price: getTotalPrice(),
      toppings: selectedToppings?.map(t => t?.name),
      sizeId: selectedSize?.id,
      toppingIds: selectedToppings?.map(t => t?.id)
    };

    onAddToCart(cartItem);
    onClose();
    setSelectedSize(null);
    setSelectedToppings([]);
  };

  const handleClose = () => {
    onClose();
    setSelectedSize(null);
    setSelectedToppings([]);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-custom z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-elevation-3 w-full max-w-md max-h-[90vh] overflow-hidden animate-spring">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Customize Order
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            iconName="X"
            iconSize={20}
            className="touch-feedback"
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-4 space-y-6">
            {/* Product Info */}
            <div className="text-center">
              <h4 className="font-semibold text-foreground mb-1">{product?.name}</h4>
              <p className="text-sm text-muted-foreground">{product?.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <h5 className="font-medium text-foreground mb-3">Select Size *</h5>
              <div className="space-y-2">
                {product?.sizes?.map((size) => (
                  <button
                    key={size?.id}
                    onClick={() => setSelectedSize(size)}
                    className={`w-full p-3 rounded-lg border transition-all touch-feedback ${
                      selectedSize?.id === size?.id
                        ? 'border-primary bg-primary/10 text-primary' :'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-medium">{size?.name}</div>
                        <div className="text-sm text-muted-foreground">{size?.description}</div>
                      </div>
                      <div className="font-semibold">
                        {formatPrice(size?.price)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings Selection */}
            {product?.availableToppings && product?.availableToppings?.length > 0 && (
              <div>
                <h5 className="font-medium text-foreground mb-3">Add Toppings (Optional)</h5>
                <div className="space-y-2">
                  {product?.availableToppings?.map((topping) => {
                    const isSelected = selectedToppings?.find(t => t?.id === topping?.id);
                    return (
                      <button
                        key={topping?.id}
                        onClick={() => handleToppingToggle(topping)}
                        className={`w-full p-3 rounded-lg border transition-all touch-feedback ${
                          isSelected
                            ? 'border-accent bg-accent/10 text-accent-foreground'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'border-accent bg-accent' : 'border-muted-foreground'
                            }`}>
                              {isSelected && (
                                <Icon name="Check" size={12} className="text-white" />
                              )}
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{topping?.name}</div>
                              <div className="text-sm text-muted-foreground">{topping?.description}</div>
                            </div>
                          </div>
                          <div className="font-semibold">
                            +{formatPrice(topping?.price)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-foreground">Total Price:</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(getTotalPrice())}
            </span>
          </div>
          <Button
            variant="default"
            size="lg"
            onClick={handleAddToCart}
            disabled={!selectedSize}
            iconName="Plus"
            iconPosition="left"
            iconSize={18}
            className="w-full touch-feedback"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SizeSelectionModal;