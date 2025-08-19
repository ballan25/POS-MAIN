import React from 'react';
import Icon from '../../../components/AppIcon';

const ShiftStatus = () => {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  
  // Mock active sessions data
  const activeSessions = [
    {
      id: 1,
      cashierName: 'Sarah Johnson',
      role: 'cashier',
      loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      pendingTransactions: 2,
      status: 'active'
    },
    {
      id: 2,
      cashierName: 'Mike Chen',
      role: 'manager',
      loginTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      pendingTransactions: 0,
      status: 'idle'
    }
  ];

  const getShiftInfo = () => {
    if (currentHour >= 6 && currentHour < 14) {
      return {
        name: 'Morning Shift',
        time: '6:00 AM - 2:00 PM',
        icon: 'Sunrise',
        color: 'text-amber-600'
      };
    } else if (currentHour >= 14 && currentHour < 22) {
      return {
        name: 'Evening Shift',
        time: '2:00 PM - 10:00 PM',
        icon: 'Sun',
        color: 'text-orange-600'
      };
    } else {
      return {
        name: 'Night Shift',
        time: '10:00 PM - 6:00 AM',
        icon: 'Moon',
        color: 'text-blue-600'
      };
    }
  };

  const shiftInfo = getShiftInfo();

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSessionDuration = (loginTime) => {
    const duration = Math.floor((Date.now() - loginTime?.getTime()) / (1000 * 60));
    if (duration < 60) {
      return `${duration}m`;
    }
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Current Shift Info */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">
            Current Shift
          </h3>
          <div className={`flex items-center space-x-2 ${shiftInfo?.color}`}>
            <Icon name={shiftInfo?.icon} size={20} />
            <span className="text-sm font-medium">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full bg-current ${shiftInfo?.color}`} />
          <div>
            <p className="font-medium text-foreground">
              {shiftInfo?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {shiftInfo?.time}
            </p>
          </div>
        </div>
      </div>
      {/* Active Sessions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Active Sessions
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-success font-medium">
              {activeSessions?.length} Online
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {activeSessions?.map((session) => (
            <div
              key={session?.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  session?.role === 'manager' ? 'bg-secondary' : 'bg-primary'
                }`}>
                  <Icon 
                    name={session?.role === 'manager' ? 'Shield' : 'User'} 
                    size={16} 
                    className="text-white" 
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {session?.cashierName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {session?.role} • {getSessionDuration(session?.loginTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {session?.pendingTransactions > 0 && (
                  <div className="flex items-center space-x-1 text-warning">
                    <Icon name="Clock" size={14} />
                    <span className="text-xs font-medium">
                      {session?.pendingTransactions}
                    </span>
                  </div>
                )}
                <div className={`w-2 h-2 rounded-full ${
                  session?.status === 'active' ? 'bg-success' : 'bg-muted-foreground'
                }`} />
              </div>
            </div>
          ))}
        </div>

        {activeSessions?.length === 0 && (
          <div className="text-center py-6">
            <Icon name="Users" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No active sessions
            </p>
          </div>
        )}
      </div>
      {/* Handover Notice */}
      {activeSessions?.some(s => s?.pendingTransactions > 0) && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-warning mb-1">
                Pending Transactions
              </h4>
              <p className="text-sm text-warning/80">
                There are pending transactions from the previous shift. Please coordinate with the outgoing cashier for proper handover.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftStatus;