import React from 'react';

const StatusIndicators = ({ mpesaStatus, firestoreStatus, lastSync }) => {
  const statusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-success';
      case 'disconnected':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex items-center gap-4 py-2 px-2 text-xs">
      <div className={`flex items-center gap-1 ${statusColor(mpesaStatus)}`}>
        <span className="font-semibold">MPESA:</span>
        <span>{mpesaStatus}</span>
      </div>
      <div className={`flex items-center gap-1 ${statusColor(firestoreStatus)}`}>
        <span className="font-semibold">DB:</span>
        <span>{firestoreStatus}</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <span className="font-semibold">Sync:</span>
        <span>{lastSync ? new Date(lastSync).toLocaleTimeString() : 'N/A'}</span>
      </div>
    </div>
  );
};

export default StatusIndicators;
