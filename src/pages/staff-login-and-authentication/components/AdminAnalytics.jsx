import React from 'react';
import Icon from '../../../components/AppIcon';

const AdminAnalytics = () => {
  // Mock analytics data
  const loginAnalytics = {
    todayLogins: 12,
    weeklyLogins: 84,
    averageSessionTime: '4h 32m',
    peakHour: '2:00 PM - 3:00 PM'
  };

  const recentActivity = [
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'Login',
      time: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      device: 'POS Terminal 1',
      status: 'success'
    },
    {
      id: 2,
      user: 'Mike Chen',
      action: 'Failed Login',
      time: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      device: 'POS Terminal 2',
      status: 'failed'
    },
    {
      id: 3,
      user: 'Lisa Wang',
      action: 'Logout',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      device: 'POS Terminal 3',
      status: 'success'
    }
  ];

  const securityAlerts = [
    {
      id: 1,
      type: 'Multiple Failed Attempts',
      description: 'User attempted login 4 times with incorrect password',
      time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      severity: 'medium',
      user: 'john.doe@bobacafe.com'
    },
    {
      id: 2,
      type: 'Unusual Login Time',
      description: 'Login detected outside normal business hours',
      time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      severity: 'low',
      user: 'night.manager@bobacafe.com'
    }
  ];

  const formatTime = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-error bg-error/10 border-error/20';
      case 'medium':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Login Statistics */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="BarChart3" size={20} className="mr-2" />
          Login Analytics
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">
              {loginAnalytics?.todayLogins}
            </div>
            <div className="text-sm text-muted-foreground">
              Today's Logins
            </div>
          </div>
          
          <div className="text-center p-3 bg-secondary/5 rounded-lg">
            <div className="text-2xl font-bold text-secondary mb-1">
              {loginAnalytics?.weeklyLogins}
            </div>
            <div className="text-sm text-muted-foreground">
              This Week
            </div>
          </div>
          
          <div className="text-center p-3 bg-accent/5 rounded-lg">
            <div className="text-lg font-bold text-accent mb-1">
              {loginAnalytics?.averageSessionTime}
            </div>
            <div className="text-sm text-muted-foreground">
              Avg Session
            </div>
          </div>
          
          <div className="text-center p-3 bg-success/5 rounded-lg">
            <div className="text-sm font-bold text-success mb-1">
              {loginAnalytics?.peakHour}
            </div>
            <div className="text-xs text-muted-foreground">
              Peak Hours
            </div>
          </div>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Activity" size={20} className="mr-2" />
          Recent Activity
        </h3>
        
        <div className="space-y-3">
          {recentActivity?.map((activity) => (
            <div
              key={activity?.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity?.status === 'success' ? 'bg-success/20' : 'bg-error/20'
                }`}>
                  <Icon 
                    name={activity?.status === 'success' ? 'CheckCircle' : 'XCircle'} 
                    size={16} 
                    className={activity?.status === 'success' ? 'text-success' : 'text-error'} 
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {activity?.user}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity?.action} • {activity?.device}
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {formatTime(activity?.time)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Security Alerts */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Shield" size={20} className="mr-2" />
          Security Alerts
        </h3>
        
        <div className="space-y-3">
          {securityAlerts?.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="AlertTriangle" size={16} />
                    <h4 className="font-medium text-sm">
                      {alert.type}
                    </h4>
                  </div>
                  <p className="text-sm opacity-80 mb-2">
                    {alert.description}
                  </p>
                  <p className="text-xs opacity-70">
                    User: {alert.user}
                  </p>
                </div>
                <div className="text-xs opacity-70 ml-3">
                  {formatTime(alert.time)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {securityAlerts?.length === 0 && (
          <div className="text-center py-6">
            <Icon name="ShieldCheck" size={32} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No security alerts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;