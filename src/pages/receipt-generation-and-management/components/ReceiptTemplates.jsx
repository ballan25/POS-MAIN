import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ReceiptTemplates = ({ 
  selectedTemplate, 
  onSelectTemplate, 
  onSaveTemplate, 
  isVisible, 
  onToggle,
  user 
}) => {
  const [customMessage, setCustomMessage] = useState('');
  const [showPromo, setShowPromo] = useState(true);
  const [logoSize, setLogoSize] = useState('medium');

  const templates = [
    {
      id: 'standard',
      name: 'Standard Receipt',
      description: 'Basic receipt with essential order information',
      preview: 'Standard layout with shop details, items, and totals',
      features: ['Shop branding', 'Order details', 'Payment info', 'Basic footer']
    },
    {
      id: 'detailed',
      name: 'Detailed Receipt',
      description: 'Comprehensive receipt with additional information',
      preview: 'Detailed layout with nutritional info and preparation notes',
      features: ['All standard features', 'Item descriptions', 'Nutritional info', 'Preparation time']
    },
    {
      id: 'promotional',
      name: 'Promotional Receipt',
      description: 'Receipt with marketing messages and offers',
      preview: 'Marketing-focused layout with promotional content',
      features: ['All detailed features', 'Promotional messages', 'Loyalty program', 'Social media links']
    },
    {
      id: 'minimal',
      name: 'Minimal Receipt',
      description: 'Clean, simple receipt for quick printing',
      preview: 'Minimal layout focusing on essential information only',
      features: ['Order summary', 'Payment details', 'Compact design', 'Fast printing']
    }
  ];

  const logoSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  const handleSaveCustomization = () => {
    const customization = {
      customMessage,
      showPromo,
      logoSize
    };
    onSaveTemplate(selectedTemplate, customization);
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        iconName="Layout"
        iconPosition="left"
        iconSize={16}
        className="fixed bottom-4 left-4 z-50 shadow-elevation-2 touch-feedback"
      >
        Templates
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-96 bg-card border border-border rounded-lg shadow-elevation-3 z-50 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Layout" size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">Receipt Templates</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          iconName="X"
          iconSize={16}
          className="touch-feedback"
        />
      </div>
      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {/* Template Selection */}
        <div className="p-4 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Choose Template</h4>
          <div className="space-y-2">
            {templates?.map((template) => (
              <div
                key={template?.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all touch-feedback ${
                  selectedTemplate === template?.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => onSelectTemplate(template?.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="text-sm font-medium text-foreground">{template?.name}</h5>
                    <p className="text-xs text-muted-foreground">{template?.description}</p>
                  </div>
                  {selectedTemplate === template?.id && (
                    <Icon name="Check" size={16} className="text-primary" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template?.features?.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Options */}
        {user?.role === 'manager' && (
          <div className="p-4 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">Customization</h4>
            <div className="space-y-3">
              {/* Logo Size */}
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Logo Size</label>
                <div className="flex space-x-2">
                  {logoSizeOptions?.map((option) => (
                    <button
                      key={option?.value}
                      onClick={() => setLogoSize(option?.value)}
                      className={`px-3 py-1 text-xs rounded border transition-colors touch-feedback ${
                        logoSize === option?.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-foreground hover:border-primary/50'
                      }`}
                    >
                      {option?.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <Input
                label="Custom Footer Message"
                type="text"
                placeholder="Thank you for visiting us!"
                value={customMessage}
                onChange={(e) => setCustomMessage(e?.target?.value)}
                description="Add a personalized message to receipts"
              />

              {/* Promotional Content */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-medium text-foreground">Show Promotions</label>
                  <p className="text-xs text-muted-foreground">Include promotional content</p>
                </div>
                <button
                  onClick={() => setShowPromo(!showPromo)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors touch-feedback ${
                    showPromo ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      showPromo ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Preview</h4>
          <div className="bg-muted/30 border border-border rounded-lg p-3">
            <div className="text-center mb-3">
              <div className={`mx-auto mb-2 bg-primary rounded flex items-center justify-center ${
                logoSize === 'small' ? 'w-6 h-6' : logoSize === 'large' ? 'w-12 h-12' : 'w-8 h-8'
              }`}>
                <svg viewBox="0 0 24 24" className={`text-primary-foreground ${
                  logoSize === 'small' ? 'w-4 h-4' : logoSize === 'large' ? 'w-8 h-8' : 'w-5 h-5'
                }`} fill="currentColor">
                  <circle cx="12" cy="8" r="3" />
                  <circle cx="12" cy="16" r="2" />
                  <path d="M8 12h8" strokeWidth="2" stroke="currentColor" fill="none" />
                </svg>
              </div>
              <h5 className="text-sm font-semibold text-foreground">Boba Bliss Café</h5>
            </div>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Order #12345</span>
                <span>KES 850.00</span>
              </div>
              <div className="flex justify-between">
                <span>Large Taro Bubble Tea</span>
                <span>KES 450.00</span>
              </div>
              <div className="flex justify-between">
                <span>Medium Thai Tea</span>
                <span>KES 400.00</span>
              </div>
              <div className="border-t border-border pt-1 mt-2">
                <div className="flex justify-between font-medium text-foreground">
                  <span>Total:</span>
                  <span>KES 850.00</span>
                </div>
              </div>
            </div>

            {showPromo && (
              <div className="mt-3 pt-2 border-t border-border text-center">
                <p className="text-xs text-primary">🎉 Get 10% off your next visit!</p>
              </div>
            )}

            {customMessage && (
              <div className="mt-2 text-center">
                <p className="text-xs text-muted-foreground">{customMessage}</p>
              </div>
            )}
          </div>

          {user?.role === 'manager' && (
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveCustomization}
              iconName="Save"
              iconPosition="left"
              iconSize={14}
              className="w-full mt-3 touch-feedback"
            >
              Save Template Settings
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptTemplates;