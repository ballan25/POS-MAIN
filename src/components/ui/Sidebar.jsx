import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ user, isCollapsed = false, onToggleCollapse, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    transactions: true,
    management: true
  });

  const navigationSections = [
    {
      id: 'transactions',
      label: 'Transaction Processing',
      icon: 'ShoppingCart',
      items: [
        {
          label: 'POS System',
          path: '/point-of-sale-order-processing',
          icon: 'ShoppingCart',
          roles: ['cashier', 'manager'],
          description: 'Process customer orders'
        },
        {
          label: 'Payment',
          path: '/payment-processing-and-checkout',
          icon: 'CreditCard',
          roles: ['cashier', 'manager'],
          description: 'Handle payments & checkout'
        }
      ]
    },
    {
      id: 'management',
      label: 'Management Hub',
      icon: 'Settings',
      items: [
        {
          label: 'Dashboard',
          path: '/admin-sales-dashboard-and-analytics',
          icon: 'BarChart3',
          roles: ['manager'],
          description: 'Sales analytics & reports'
        },
        {
          label: 'Products',
          path: '/product-catalog-management',
          icon: 'Package',
          roles: ['manager'],
          description: 'Manage product catalog'
        },
        {
          label: 'Receipts',
          path: '/receipt-generation-and-management',
          icon: 'Receipt',
          roles: ['cashier', 'manager'],
          description: 'Receipt management'
        }
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/staff-login-and-authentication');
  };

  const toggleSection = (sectionId) => {
    if (!isCollapsed) {
      setExpandedSections(prev => ({
        ...prev,
        [sectionId]: !prev?.[sectionId]
      }));
    }
  };

  const isActive = (path) => location.pathname === path;

  const hasPermission = (roles) => {
    if (!user?.role) return false;
    return roles?.includes(user?.role);
  };

  const getVisibleSections = () => {
    return navigationSections?.map(section => ({
      ...section,
      items: section?.items?.filter(item => hasPermission(item?.roles))
    }))?.filter(section => section?.items?.length > 0);
  };

  const visibleSections = getVisibleSections();

  return (
    <>
      <aside className={`fixed left-0 top-16 bottom-0 z-40 bg-card border-r border-border shadow-elevation-1 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex flex-col h-full">
          {/* Collapse Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isCollapsed && (
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Navigation
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="touch-feedback"
              iconName={isCollapsed ? "ChevronRight" : "ChevronLeft"}
              iconSize={16}
            />
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-2">
              {visibleSections?.map((section) => (
                <div key={section?.id} className="px-3">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section?.id)}
                    className={`w-full flex items-center justify-between p-2 text-left rounded-md hover:bg-muted transition-colors touch-feedback ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                    title={isCollapsed ? section?.label : undefined}
                  >
                    <div className="flex items-center">
                      <Icon 
                        name={section?.icon} 
                        size={18} 
                        className="text-muted-foreground" 
                      />
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium text-foreground">
                          {section?.label}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <Icon
                        name={expandedSections?.[section?.id] ? "ChevronDown" : "ChevronRight"}
                        size={14}
                        className="text-muted-foreground"
                      />
                    )}
                  </button>

                  {/* Section Items */}
                  {(expandedSections?.[section?.id] || isCollapsed) && (
                    <div className={`mt-1 space-y-1 ${isCollapsed ? '' : 'ml-4'}`}>
                      {section?.items?.map((item) => (
                        <button
                          key={item?.path}
                          onClick={() => handleNavigation(item?.path)}
                          className={`w-full flex items-center p-2 text-left rounded-md transition-colors touch-feedback ${
                            isActive(item?.path)
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-foreground hover:bg-muted'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                          title={isCollapsed ? `${item?.label} - ${item?.description}` : item?.description}
                        >
                          <Icon 
                            name={item?.icon} 
                            size={16} 
                            className={isActive(item?.path) ? 'text-primary-foreground' : 'text-muted-foreground'} 
                          />
                          {!isCollapsed && (
                            <div className="ml-3">
                              <div className="text-sm font-medium">
                                {item?.label}
                              </div>
                              <div className={`text-xs ${
                                isActive(item?.path) 
                                  ? 'text-primary-foreground/80' 
                                  : 'text-muted-foreground'
                              }`}>
                                {item?.description}
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-4">
            {user && (
              <div className={`flex items-center mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="User" size={16} className="text-primary-foreground" />
                </div>
                {!isCollapsed && (
                  <div className="ml-3 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              size={isCollapsed ? "icon" : "sm"}
              onClick={handleLogout}
              iconName="LogOut"
              iconPosition={isCollapsed ? undefined : "left"}
              iconSize={16}
              className="w-full touch-feedback"
              title={isCollapsed ? "Logout" : undefined}
            >
              {!isCollapsed && "Logout"}
            </Button>
          </div>
        </div>
      </aside>
      {/* Main content offset */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* This div ensures main content doesn't overlap with sidebar */}
      </div>
    </>
  );
};

export default Sidebar;