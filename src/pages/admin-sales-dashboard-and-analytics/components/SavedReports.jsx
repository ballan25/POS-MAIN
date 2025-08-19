import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SavedReports = ({
  currentReportData = null, // Current report configuration to save
  onLoadReport = null, // Callback when loading a report
  apiEndpoint = '/api/reports/saved',
  refreshInterval = 0, // No auto-refresh by default for reports
  onError = (error) => console.error('Error with saved reports:', error)
}) => {
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [savingReport, setSavingReport] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState(null);

  // Fetch saved reports
  const fetchSavedReports = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Validate and process data
      const validatedReports = Array.isArray(result) ? result : result.data || [];
      
      // Ensure each report has required fields
      const processedReports = validatedReports.map(report => ({
        id: report.id || `report_${Date.now()}`,
        name: report.name || 'Untitled Report',
        description: report.description || '',
        dateRange: report.dateRange || { start: null, end: null },
        filters: Array.isArray(report.filters) ? report.filters : [],
        createdAt: report.createdAt || new Date().toISOString(),
        updatedAt: report.updatedAt || report.createdAt || new Date().toISOString(),
        reportType: report.reportType || 'custom',
        parameters: report.parameters || {},
        isShared: report.isShared || false,
        createdBy: report.createdBy || 'current_user',
        ...report // Include any additional fields
      }));

      setSavedReports(processedReports);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      onError(err);
    }
  }, [apiEndpoint, onError]);

  // Initial data fetch
  useEffect(() => {
    fetchSavedReports();
  }, [fetchSavedReports]);

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchSavedReports, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSavedReports, refreshInterval]);

  // Load a saved report
  const handleLoadReport = async (report) => {
    try {
      setError(null);
      
      // Fetch the full report data from the server
      const response = await fetch(`${apiEndpoint}/${report.id}/load`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load report: ${response.status}`);
      }

      const reportData = await response.json();
      
      // Call the parent callback with the loaded report data
      if (onLoadReport) {
        onLoadReport({
          ...reportData,
          reportConfig: report
        });
      }

    } catch (err) {
      setError(`Failed to load report: ${err.message}`);
      onError(err);
    }
  };

  // Save current report
  const handleSaveCurrentReport = async () => {
    if (!reportName?.trim()) {
      alert('Please enter a report name');
      return;
    }

    setSavingReport(true);

    try {
      const newReport = {
        name: reportName.trim(),
        description: reportDescription.trim() || 'Custom saved report',
        dateRange: currentReportData?.dateRange || { start: null, end: null },
        filters: currentReportData?.filters || [],
        reportType: currentReportData?.reportType || 'custom',
        parameters: currentReportData?.parameters || {},
        data: currentReportData?.data || null // Include current data if provided
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });

      if (!response.ok) {
        throw new Error(`Failed to save report: ${response.status}`);
      }

      const savedReport = await response.json();

      // Add to local state
      setSavedReports([savedReport, ...savedReports]);
      setReportName('');
      setReportDescription('');
      setShowSaveModal(false);
      setSavingReport(false);
      
      alert(`Report "${savedReport.name}" saved successfully!`);
      
    } catch (err) {
      setSavingReport(false);
      setError(`Failed to save report: ${err.message}`);
      alert(`Failed to save report: ${err.message}`);
      onError(err);
    }
  };

  // Delete a report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    setDeletingReportId(reportId);

    try {
      const response = await fetch(`${apiEndpoint}/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete report: ${response.status}`);
      }

      // Remove from local state
      setSavedReports(savedReports.filter(report => report.id !== reportId));
      setDeletingReportId(null);
      
    } catch (err) {
      setDeletingReportId(null);
      setError(`Failed to delete report: ${err.message}`);
      alert(`Failed to delete report: ${err.message}`);
      onError(err);
    }
  };

  // Duplicate a report
  const handleDuplicateReport = async (report) => {
    try {
      const duplicatedReport = {
        ...report,
        name: `${report.name} (Copy)`,
        id: undefined, // Let server generate new ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedReport),
      });

      if (!response.ok) {
        throw new Error(`Failed to duplicate report: ${response.status}`);
      }

      const newReport = await response.json();
      setSavedReports([newReport, ...savedReports]);
      
      alert(`Report duplicated as "${newReport.name}"`);
      
    } catch (err) {
      setError(`Failed to duplicate report: ${err.message}`);
      alert(`Failed to duplicate report: ${err.message}`);
      onError(err);
    }
  };

  // Export report
  const handleExportReport = async (report) => {
    try {
      const response = await fetch(`${apiEndpoint}/${report.id}/export`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export report: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      setError(`Failed to export report: ${err.message}`);
      alert(`Failed to export report: ${err.message}`);
      onError(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (dateRange) => {
    if (!dateRange?.start || !dateRange?.end) return 'No date range';
    return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="BookOpen" size={20} className="mr-2" />
            Saved Reports
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span className="text-muted-foreground">Loading saved reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="BookOpen" size={20} className="mr-2" />
          Saved Reports
          <span className="ml-2 text-sm text-muted-foreground">
            ({savedReports.length})
          </span>
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSavedReports}
            iconName="RefreshCw"
            iconSize={14}
            className="touch-feedback"
            disabled={loading}
            title="Refresh reports"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveModal(true)}
            iconName="Plus"
            iconSize={14}
            className="touch-feedback"
            disabled={!currentReportData}
            title={!currentReportData ? "No report data to save" : "Save current report"}
          >
            Save Current
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {savedReports?.map((report) => (
          <div key={report.id} className="border border-border rounded-md p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {report.name}
                  </h4>
                  {report.isShared && (
                    <Icon name="Users" size={12} className="text-primary" title="Shared report" />
                  )}
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {report.reportType}
                  </span>
                </div>
                
                {report.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {report.description}
                  </p>
                )}
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>{formatDateRange(report.dateRange)}</div>
                  <div className="flex items-center space-x-3">
                    <span>Created {formatTimeAgo(report.createdAt)}</span>
                    {report.filters?.length > 0 && (
                      <span>{report.filters.length} filter{report.filters.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1 ml-2">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLoadReport(report)}
                    iconName="Eye"
                    iconSize={14}
                    className="touch-feedback"
                    title="Load this report"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExportReport(report)}
                    iconName="Download"
                    iconSize={14}
                    className="touch-feedback"
                    title="Export report"
                  />
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateReport(report)}
                    iconName="Copy"
                    iconSize={14}
                    className="touch-feedback"
                    title="Duplicate report"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReport(report.id)}
                    iconName={deletingReportId === report.id ? "Loader2" : "Trash2"}
                    iconSize={14}
                    className={`touch-feedback text-error hover:text-error ${
                      deletingReportId === report.id ? 'animate-spin' : ''
                    }`}
                    disabled={deletingReportId === report.id}
                    title="Delete report"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {savedReports?.length === 0 && !loading && (
        <div className="text-center py-8">
          <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-2">No saved reports yet</p>
          <p className="text-xs text-muted-foreground">
            Create and save reports to access them later
          </p>
        </div>
      )}

      {/* Save Report Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Save Current Report</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSaveModal(false)}
                iconName="X"
                iconSize={16}
                className="touch-feedback"
                disabled={savingReport}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Report Name *
                </label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name..."
                  className="w-full"
                  disabled={savingReport}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Input
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Brief description (optional)..."
                  className="w-full"
                  disabled={savingReport}
                />
              </div>

              {currentReportData && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                  <div className="font-medium mb-1">Report Preview:</div>
                  <div>Date Range: {formatDateRange(currentReportData.dateRange)}</div>
                  {currentReportData.filters?.length > 0 && (
                    <div>Filters: {currentReportData.filters.length} active</div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveModal(false)}
                  className="touch-feedback"
                  disabled={savingReport}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCurrentReport}
                  className="touch-feedback"
                  iconName={savingReport ? "Loader2" : "Save"}
                  iconPosition="left"
                  disabled={savingReport}
                >
                  {savingReport ? 'Saving...' : 'Save Report'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedReports;