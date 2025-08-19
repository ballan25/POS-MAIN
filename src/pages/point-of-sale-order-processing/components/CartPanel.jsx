import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CartPanel = ({ 
  cartItems, 
  cartTotal, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onProceedToPayment,
  currentUser 
}) => {
  const formatPrice = (price) => {
    return `KES ${price?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const getTotalItems = () => {
    return cartItems?.reduce((total, item) => total + item?.quantity, 0);
  };

  return (
    <div className="w-full bg-card border border-border rounded-lg flex flex-col max-h-80">
      {/* Ultra Compact Cart Header */}
      <div className="p-2 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Current Order</h2>
          <div className="flex items-center space-x-1">
            <div className="bg-primary text-primary-foreground px-1.5 py-1.0 rounded-full text-xs font-medium">
              {getTotalItems()}
            </div>
            {cartItems?.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearCart}
                iconName="Trash2"
                iconSize={12}
                className="text-error hover:text-error hover:bg-error/10 touch-feedback w-6 h-6"
                title="Clear cart"
              />
            )}
          </div>
        </div>
        
        {currentUser && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {currentUser?.name} | {currentUser?.id}
          </div>
        )}
      </div>

      {/* Cart Items - Ultra Compact */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {cartItems?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Icon name="ShoppingCart" size={24} className="text-muted-foreground mb-2" />
            <h3 className="text-xs font-medium text-foreground mb-1">Cart is Empty</h3>
            <p className="text-xs text-muted-foreground">Add items to start</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {cartItems?.map((item) => (
              <div key={item?.cartId} className="bg-muted/20 rounded p-1.5 border border-border/30">
                {/* Single Row Layout */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-medium text-xs text-foreground truncate leading-tight">
                      {item?.name}
                    </h4>
                    <div className="flex items-center space-x-1 mt-0.5">
                      {item?.size && (
                        <span className="text-xs text-muted-foreground">
                          {item?.size}
                        </span>
                      )}
                      {item?.toppings && item?.toppings?.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          | +{item?.toppings?.length}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Quantity Controls - Inline */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(item?.cartId, item?.quantity - 1)}
                      disabled={item?.quantity <= 1}
                      iconName="Minus"
                      iconSize={8}
                      className="w-5 h-5 touch-feedback"
                    />
                    <span className="w-4 text-center text-xs font-medium text-foreground">
                      {item?.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(item?.cartId, item?.quantity + 1)}
                      iconName="Plus"
                      iconSize={8}
                      className="w-5 h-5 touch-feedback"
                    />
                  </div>
                  
                  {/* Price and Remove */}
                  <div className="flex items-center space-x-1 ml-2">
                    <span className="text-xs font-semibold text-foreground">
                      {formatPrice(item?.price * item?.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item?.cartId)}
                      iconName="X"
                      iconSize={10}
                      className="text-error hover:text-error hover:bg-error/10 touch-feedback w-5 h-5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ultra Compact Footer */}
      {cartItems?.length > 0 && (
        <div className="border-t border-border p-2">
          {/* Total without tax calculations */}
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-bold text-primary">
              {formatPrice(cartTotal)}
            </span>
          </div>

          <Button
            variant="default"
            size="default"
            onClick={onProceedToPayment}
            iconName="CreditCard"
            iconPosition="left"
            iconSize={14}
            className="w-full touch-feedback text-xs py-1.5"
          >
            Proceed to Payment
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
