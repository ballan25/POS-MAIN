import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PrintQueue = ({ 
  printQueue, 
  onRetryPrint, 
  onRemoveFromQueue, 
  onClearQueue,
  isVisible,
  onToggle 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const pendingJobs = printQueue?.filter(job => job?.status === 'pending');
  const failedJobs = printQueue?.filter(job => job?.status === 'failed');
  const completedJobs = printQueue?.filter(job => job?.status === 'completed');

  const formatDate = (date) => {
    return new Date(date)?.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return { name: 'Clock', className: 'text-warning' };
      case 'printing':
        return { name: 'Printer', className: 'text-primary animate-pulse' };
      case 'completed':
        return { name: 'CheckCircle', className: 'text-success' };
      case 'failed':
        return { name: 'XCircle', className: 'text-error' };
      default:
        return { name: 'Circle', className: 'text-muted-foreground' };
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        iconName="Printer"
        iconPosition="left"
        iconSize={16}
        className="fixed bottom-4 right-4 z-50 shadow-elevation-2 touch-feedback"
      >Print Queue ({printQueue?.length})
              </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-card border border-border rounded-lg shadow-elevation-3 z-50 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Printer" size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">Print Queue</h3>
          {printQueue?.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {printQueue?.length}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronDown" : "ChevronUp"}
            iconSize={16}
            className="touch-feedback"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            iconName="X"
            iconSize={16}
            className="touch-feedback"
          />
        </div>
      </div>
      {/* Content */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {/* Actions */}
          {printQueue?.length > 0 && (
            <div className="p-3 border-b border-border bg-muted/30">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearQueue}
                  iconName="Trash2"
                  iconPosition="left"
                  iconSize={14}
                  className="flex-1 touch-feedback"
                >
                  Clear All
                </Button>
                {failedJobs?.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => failedJobs?.forEach(job => onRetryPrint(job?.id))}
                    iconName="RotateCcw"
                    iconPosition="left"
                    iconSize={14}
                    className="flex-1 touch-feedback"
                  >
                    Retry Failed
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Queue Items */}
          <div className="p-2">
            {printQueue?.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="Printer" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No print jobs in queue</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Pending Jobs */}
                {pendingJobs?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Pending ({pendingJobs?.length})
                    </h4>
                    {pendingJobs?.map((job) => {
                      const statusIcon = getStatusIcon(job?.status);
                      return (
                        <div key={job?.id} className="flex items-center justify-between p-2 bg-warning/5 border border-warning/20 rounded-md">
                          <div className="flex items-center space-x-2">
                            <Icon name={statusIcon?.name} size={14} className={statusIcon?.className} />
                            <div>
                              <p className="text-sm font-medium text-foreground">#{job?.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(job?.timestamp)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveFromQueue(job?.id)}
                            iconName="X"
                            iconSize={12}
                            className="touch-feedback"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Failed Jobs */}
                {failedJobs?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Failed ({failedJobs?.length})
                    </h4>
                    {failedJobs?.map((job) => {
                      const statusIcon = getStatusIcon(job?.status);
                      return (
                        <div key={job?.id} className="flex items-center justify-between p-2 bg-error/5 border border-error/20 rounded-md">
                          <div className="flex items-center space-x-2">
                            <Icon name={statusIcon?.name} size={14} className={statusIcon?.className} />
                            <div>
                              <p className="text-sm font-medium text-foreground">#{job?.orderNumber}</p>
                              <p className="text-xs text-error">{job?.error || 'Print failed'}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(job?.timestamp)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRetryPrint(job?.id)}
                              iconName="RotateCcw"
                              iconSize={12}
                              className="touch-feedback"
                              title="Retry print"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveFromQueue(job?.id)}
                              iconName="X"
                              iconSize={12}
                              className="touch-feedback"
                              title="Remove from queue"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Completed Jobs */}
                {completedJobs?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Completed ({completedJobs?.length})
                    </h4>
                    {completedJobs?.slice(0, 3)?.map((job) => {
                      const statusIcon = getStatusIcon(job?.status);
                      return (
                        <div key={job?.id} className="flex items-center justify-between p-2 bg-success/5 border border-success/20 rounded-md">
                          <div className="flex items-center space-x-2">
                            <Icon name={statusIcon?.name} size={14} className={statusIcon?.className} />
                            <div>
                              <p className="text-sm font-medium text-foreground">#{job?.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(job?.timestamp)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveFromQueue(job?.id)}
                            iconName="X"
                            iconSize={12}
                            className="touch-feedback"
                          />
                        </div>
                      );
                    })}
                    {completedJobs?.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        +{completedJobs?.length - 3} more completed
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Collapsed Summary */}
      {!isExpanded && printQueue?.length > 0 && (
        <div className="p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {pendingJobs?.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={12} className="text-warning" />
                  <span className="text-warning">{pendingJobs?.length}</span>
                </div>
              )}
              {failedJobs?.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Icon name="XCircle" size={12} className="text-error" />
                  <span className="text-error">{failedJobs?.length}</span>
                </div>
              )}
              {completedJobs?.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Icon name="CheckCircle" size={12} className="text-success" />
                  <span className="text-success">{completedJobs?.length}</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-xs touch-feedback"
            >
              View All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintQueue;