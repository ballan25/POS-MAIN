import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SessionTimeout = ({ isVisible, timeRemaining, onExtendSession, onLogout }) => {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (isVisible && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isVisible, countdown, onLogout]);

  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds?.toString()?.padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-custom z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevation-3 max-w-md w-full p-6 animate-spring">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Clock" size={32} className="text-warning" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Session Expiring Soon
          </h2>
          
          <p className="text-muted-foreground mb-4">
            Your session will expire in {formatTime(countdown)} due to inactivity.
          </p>
          
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Icon name="Timer" size={20} className="text-warning" />
              <span className="text-2xl font-mono font-bold text-warning">
                {formatTime(countdown)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="default"
            size="lg"
            fullWidth
            onClick={onExtendSession}
            iconName="RefreshCw"
            iconPosition="left"
            className="touch-feedback"
          >
            Extend Session
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={onLogout}
            iconName="LogOut"
            iconPosition="left"
            className="touch-feedback"
          >
            Logout Now
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              For security purposes, inactive sessions are automatically logged out. 
              Click "Extend Session" to continue working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeout;