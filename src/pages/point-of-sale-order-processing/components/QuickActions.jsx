import React from 'react';
import Button from '../../../components/ui/Button';

const QuickActions = ({ 
  onQuickReorder, 
  onBarcodeMode, 
  onCustomerPreferences,
  recentOrders,
  barcodeMode 
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-3 mb-4">
      <h4 className="text-sm font-medium text-foreground mb-3">Quick Actions</h4>
      <div className="space-y-2">
        {/* Barcode Scanner Toggle */}
        <Button
          variant={barcodeMode ? "default" : "outline"}
          size="sm"
          onClick={onBarcodeMode}
          iconName="Scan"
          iconPosition="left"
          iconSize={14}
          className="w-full touch-feedback"
        >
          {barcodeMode ? 'Exit Scanner' : 'Barcode Scanner'}
        </Button>

        {/* Customer Preferences */}
        <Button
          variant="outline"
          size="sm"
          onClick={onCustomerPreferences}
          iconName="Heart"
          iconPosition="left"
          iconSize={14}
          className="w-full touch-feedback"
        >
          Customer Favorites
        </Button>

        {/* Recent Orders */}
        {recentOrders && recentOrders?.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Recent Orders</p>
            <div className="space-y-1">
              {recentOrders?.slice(0, 3)?.map((order) => (
                <button
                  key={order?.id}
                  onClick={() => onQuickReorder(order)}
                  className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors touch-feedback"
                >
                  <div className="text-xs font-medium text-foreground truncate">
                    Order #{order?.id?.slice(-6)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order?.items?.length} items • KES {order?.total?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActions;