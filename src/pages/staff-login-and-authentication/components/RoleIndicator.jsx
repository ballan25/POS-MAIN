import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleIndicator = ({ selectedRole, onRoleChange, disabled }) => {
  const roles = [
    {
      id: 'cashier',
      label: 'Cashier',
      description: 'Process orders and handle payments',
      icon: 'ShoppingCart',
      color: 'bg-primary',
      textColor: 'text-primary-foreground'
    },
    {
      id: 'manager',
      label: 'Manager',
      description: 'Full system access and analytics',
      icon: 'Shield',
      color: 'bg-secondary',
      textColor: 'text-secondary-foreground'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Select Your Role
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose your access level for this session
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles?.map((role) => (
          <button
            key={role?.id}
            type="button"
            onClick={() => onRoleChange(role?.id)}
            disabled={disabled}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 touch-feedback ${
              selectedRole === role?.id
                ? `${role?.color} ${role?.textColor} border-transparent shadow-elevation-2`
                : 'bg-card text-foreground border-border hover:border-primary/30 hover:bg-muted/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedRole === role?.id
                  ? 'bg-white/20' :'bg-primary/10'
              }`}>
                <Icon 
                  name={role?.icon} 
                  size={20} 
                  className={selectedRole === role?.id ? role?.textColor : 'text-primary'} 
                />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-base">
                  {role?.label}
                </h4>
                <p className={`text-sm ${
                  selectedRole === role?.id
                    ? `${role?.textColor}/80`
                    : 'text-muted-foreground'
                }`}>
                  {role?.description}
                </p>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedRole === role?.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon name="Check" size={14} className={role?.textColor} />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleIndicator;