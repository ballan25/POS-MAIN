import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RoleIndicator from './components/RoleIndicator';
import ShiftStatus from './components/ShiftStatus';
import AdminAnalytics from './components/AdminAnalytics';
import SessionTimeout from './components/SessionTimeout';
import Icon from '../../components/AppIcon';

const StaffLoginAndAuthentication = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('cashier');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [queuedAttempts, setQueuedAttempts] = useState([]);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(300); // 5 minutes

  // Mock credentials for different roles
  const mockCredentials = {
    cashier: {
      email: 'cashier@bobacafe.com',
      password: 'cashier123',
      name: 'Sarah Johnson',
      role: 'cashier'
    },
    manager: {
      email: 'manager@bobacafe.com',
      password: 'manager123',
      name: 'Mike Chen',
      role: 'manager'
    }
  };

  useEffect(() => {
    // Check for saved login state
    const savedUser = localStorage.getItem('bobaPosUser');
    const savedRememberMe = localStorage.getItem('bobaPosRememberMe');
    
    if (savedUser && savedRememberMe === 'true') {
      const user = JSON.parse(savedUser);
      handleSuccessfulLogin(user);
    }

    // Network status listeners
    const handleOnline = () => {
      setIsOffline(false);
      processQueuedAttempts();
    };
    
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processQueuedAttempts = () => {
    if (queuedAttempts?.length > 0) {
      const latestAttempt = queuedAttempts?.[queuedAttempts?.length - 1];
      handleLogin(latestAttempt);
      setQueuedAttempts([]);
    }
  };

  const handleLogin = async (formData) => {
    if (attemptCount >= 5) {
      setError('Account temporarily locked. Please contact your manager.');
      return;
    }

    // Handle offline mode
    if (isOffline) {
      setQueuedAttempts(prev => [...prev, formData]);
      setError('No internet connection. Login attempt will be processed when connection is restored.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check credentials based on selected role
      const validCredentials = mockCredentials?.[selectedRole];
      
      if (formData?.email === validCredentials?.email && formData?.password === validCredentials?.password) {
        const user = {
          ...validCredentials,
          loginTime: new Date(),
          sessionId: `session_${Date.now()}`
        };

        handleSuccessfulLogin(user, formData?.rememberMe);
      } else {
        setAttemptCount(prev => prev + 1);
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulLogin = (user, rememberMe = false) => {
    // Save user session
    localStorage.setItem('bobaPosUser', JSON.stringify(user));
    
    if (rememberMe) {
      localStorage.setItem('bobaPosRememberMe', 'true');
    } else {
      localStorage.removeItem('bobaPosRememberMe');
    }

    // Reset attempt counter
    setAttemptCount(0);
    setError('');

    // Navigate based on role
    if (user?.role === 'manager') {
      navigate('/admin-sales-dashboard-and-analytics');
    } else {
      navigate('/point-of-sale-order-processing');
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
    setAttemptCount(0);
  };

  const handleExtendSession = () => {
    setShowSessionTimeout(false);
    setSessionTimeRemaining(300); // Reset to 5 minutes
  };

  const handleSessionLogout = () => {
    localStorage.removeItem('bobaPosUser');
    localStorage.removeItem('bobaPosRememberMe');
    setShowSessionTimeout(false);
    window.location?.reload();
  };

  // Simulate session timeout warning (for demo purposes)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localStorage.getItem('bobaPosUser')) {
        setShowSessionTimeout(true);
      }
    }, 10000); // Show after 10 seconds for demo

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" 
         style={{backgroundImage: "url('/assets/images/cafe-bg.jpg')"}}>
      
      {/* Add overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-error text-error-foreground p-2 text-center text-sm font-medium z-50">
          <Icon name="WifiOff" size={16} className="inline mr-2" />
          No internet connection - Login attempts will be queued
        </div>
      )}

      <div className="flex min-h-screen relative z-10">
        {/* Left Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Logo and Header */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mx-auto mb-6 shadow-elevation-2">
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-primary-foreground"
                  fill="currentColor"
                >
                  <circle cx="12" cy="8" r="3" />
                  <circle cx="12" cy="16" r="2" />
                  <path d="M8 12h8" strokeWidth="2" stroke="currentColor" fill="none" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                Boba POS System
              </h1>
              <p className="text-white/90 drop-shadow">
                Sign in to access your point of sale dashboard
              </p>
            </div>

            {/* Role Selection */}
            <RoleIndicator
              selectedRole={selectedRole}
              onRoleChange={handleRoleChange}
              disabled={isLoading}
            />

            {/* Login Form */}
            <LoginForm
              onLogin={handleLogin}
              isLoading={isLoading}
              error={error}
              attemptCount={attemptCount}
            />
          </div>
        </div>

        {/* Right Panel - Status Information */}
        <div className="w-96 bg-white/95 backdrop-blur-sm border-l border-white/20 p-8 overflow-y-auto shadow-xl">
          <div className="space-y-8">
            {/* Shift Status */}
            <ShiftStatus />

            {/* Admin Analytics (only show for manager role) */}
            {selectedRole === 'manager' && <AdminAnalytics />}

            {/* System Status */}
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Monitor" size={20} className="mr-2" />
                System Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">POS System</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-sm text-success font-medium">Online</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Gateway</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-sm text-success font-medium">Connected</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">M-Pesa API</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-sm text-success font-medium">Active</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Receipt Printer</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning rounded-full" />
                    <span className="text-sm text-warning font-medium">Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Icon name="TrendingUp" size={20} className="mr-2" />
                Today's Overview
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-card rounded-lg">
                  <div className="text-xl font-bold text-primary mb-1">47</div>
                  <div className="text-xs text-muted-foreground">Orders</div>
                </div>
                
                <div className="text-center p-3 bg-card rounded-lg">
                  <div className="text-xl font-bold text-success mb-1">KES 12,450</div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Timeout Modal */}
      <SessionTimeout
        isVisible={showSessionTimeout}
        timeRemaining={sessionTimeRemaining}
        onExtendSession={handleExtendSession}
        onLogout={handleSessionLogout}
      />
    </div>
  );
};

export default StaffLoginAndAuthentication;