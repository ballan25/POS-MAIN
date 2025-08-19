import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      label: 'POS',
      path: '/point-of-sale-order-processing',
      icon: 'ShoppingCart',
      roles: ['cashier', 'manager'],
      tooltip: 'Point of Sale Order Processing'
    },
    {
      label: 'Payment',
      path: '/payment-processing-and-checkout',
      icon: 'CreditCard',
      roles: ['cashier', 'manager'],
      tooltip: 'Payment Processing & Checkout'
    },
    {
      label: 'Dashboard',
      path: '/admin-sales-dashboard-and-analytics',
      icon: 'BarChart3',
      roles: ['manager'],
      tooltip: 'Sales Dashboard & Analytics'
    },
    {
      label: 'Products',
      path: '/product-catalog-management',
      icon: 'Package',
      roles: ['manager'],
      tooltip: 'Product Catalog Management'
    }
  ];

  const secondaryItems = [
    {
      label: 'Receipts',
      path: '/receipt-generation-and-management',
      icon: 'Receipt',
      roles: ['cashier', 'manager'],
      tooltip: 'Receipt Generation & Management'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/staff-login-and-authentication');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const hasPermission = (roles) => {
    if (!user?.role) return false;
    return roles?.includes(user?.role);
  };

  const visibleNavItems = navigationItems?.filter(item => hasPermission(item?.roles));
  const visibleSecondaryItems = secondaryItems?.filter(item => hasPermission(item?.roles));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-elevation-1">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-primary-foreground"
              fill="currentColor"
            >
              <circle cx="12" cy="8" r="3" />
              <circle cx="12" cy="16" r="2" />
              <path d="M8 12h8" strokeWidth="2" stroke="currentColor" fill="none" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-foreground font-sans">
              Boba POS
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Point of Sale System
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {visibleNavItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActive(item?.path) ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="left"
              iconSize={18}
              className="touch-feedback"
              title={item?.tooltip}
            >
              {item?.label}
            </Button>
          ))}
          
          {/* More Menu */}
          {visibleSecondaryItems?.length > 0 && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                iconName="MoreHorizontal"
                iconSize={18}
                className="touch-feedback"
                title="More options"
              >
                More
              </Button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-elevation-3 animate-slide-up">
                  <div className="py-2">
                    {visibleSecondaryItems?.map((item) => (
                      <button
                        key={item?.path}
                        onClick={() => handleNavigation(item?.path)}
                        className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-muted transition-colors touch-feedback ${
                          isActive(item?.path) ? 'bg-muted text-primary' : 'text-foreground'
                        }`}
                        title={item?.tooltip}
                      >
                        <Icon name={item?.icon} size={16} className="mr-3" />
                        {item?.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          {user && (
            <div className="hidden sm:flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground font-sans">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-muted-foreground font-sans capitalize">
                  {user?.role}
                </p>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} className="text-primary-foreground" />
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden touch-feedback"
            iconName={isMenuOpen ? "X" : "Menu"}
            iconSize={20}
          />

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            iconName="LogOut"
            iconPosition="left"
            iconSize={16}
            className="hidden sm:flex touch-feedback"
          >
            Logout
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border shadow-elevation-2 animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {visibleNavItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`w-full flex items-center px-3 py-3 text-left rounded-md transition-colors touch-feedback ${
                  isActive(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
                title={item?.tooltip}
              >
                <Icon name={item?.icon} size={20} className="mr-3" />
                <span className="font-medium">{item?.label}</span>
              </button>
            ))}
            
            {visibleSecondaryItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`w-full flex items-center px-3 py-3 text-left rounded-md transition-colors touch-feedback ${
                  isActive(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
                title={item?.tooltip}
              >
                <Icon name={item?.icon} size={20} className="mr-3" />
                <span className="font-medium">{item?.label}</span>
              </button>
            ))}

            <div className="border-t border-border pt-3 mt-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-3 text-left rounded-md text-error hover:bg-muted transition-colors touch-feedback"
              >
                <Icon name="LogOut" size={20} className="mr-3" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-custom z-[-1] lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;