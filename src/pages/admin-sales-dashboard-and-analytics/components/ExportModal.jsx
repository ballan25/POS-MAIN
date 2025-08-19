import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ExportModal = ({ isOpen, onClose, onExport, dateRange }) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    dataTypes: ['sales', 'transactions', 'products'],
    includeCharts: false,
    includeFilters: true,
    emailTo: '',
    fileName: `sales-report-${format(new Date(), 'yyyy-MM-dd')}`
  });
  const [isExporting, setIsExporting] = useState(false);
  const [dataSizes, setDataSizes] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch real-time data sizes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDataSizes();
    }
  }, [isOpen, dateRange]);

  const fetchDataSizes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/export/data-sizes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data sizes');
      }

      const sizes = await response.json();
      setDataSizes(sizes);
    } catch (error) {
      console.error('Error fetching data sizes:', error);
      // Fallback to estimated sizes
      setDataSizes({
        sales: 2.5,
        transactions: 5.8,
        products: 1.2,
        cashiers: 0.8,
        analytics: 1.5
      });
    } finally {
      setLoading(false);
    }
  };

  const dataTypeOptions = [
    {
      id: 'sales',
      label: 'Sales Data',
      description: 'Revenue, transactions, payment methods',
      size: dataSizes.sales ? `~${dataSizes.sales.toFixed(1)}MB` : 'Calculating...'
    },
    {
      id: 'transactions',
      label: 'Transaction Details',
      description: 'Individual transaction records with items',
      size: dataSizes.transactions ? `~${dataSizes.transactions.toFixed(1)}MB` : 'Calculating...'
    },
    {
      id: 'products',
      label: 'Product Performance',
      description: 'Product sales, rankings, growth metrics',
      size: dataSizes.products ? `~${dataSizes.products.toFixed(1)}MB` : 'Calculating...'
    },
    {
      id: 'cashiers',
      label: 'Cashier Performance',
      description: 'Staff performance metrics and efficiency',
      size: dataSizes.cashiers ? `~${dataSizes.cashiers.toFixed(1)}MB` : 'Calculating...'
    },
    {
      id: 'analytics',
      label: 'Analytics Data',
      description: 'Peak hours, trends, KPI calculations',
      size: dataSizes.analytics ? `~${dataSizes.analytics.toFixed(1)}MB` : 'Calculating...'
    }
  ];

  const formatOptions = [
    {
      value: 'csv',
      label: 'CSV Spreadsheet',
      icon: 'FileText',
      description: 'Compatible with Excel, Google Sheets'
    },
    {
      value: 'pdf',
      label: 'PDF Report',
      icon: 'FileDown',
      description: 'Formatted report with charts and graphics'
    },
    {
      value: 'json',
      label: 'JSON Data',
      icon: 'Code',
      description: 'Raw data for API integration'
    },
    {
      value: 'xlsx',
      label: 'Excel Workbook',
      icon: 'FileSpreadsheet',
      description: 'Native Excel format with multiple sheets'
    }
  ];

  const handleDataTypeToggle = (dataType) => {
    setExportOptions(prev => ({
      ...prev,
      dataTypes: prev?.dataTypes?.includes(dataType)
        ? prev?.dataTypes?.filter(type => type !== dataType)
        : [...prev?.dataTypes, dataType]
    }));
  };

  const handleSelectAllDataTypes = () => {
    const allTypes = dataTypeOptions?.map(option => option?.id);
    setExportOptions(prev => ({
      ...prev,
      dataTypes: prev?.dataTypes?.length === allTypes?.length ? [] : allTypes
    }));
  };

  const handleExport = async () => {
    if (exportOptions?.dataTypes?.length === 0) {
      alert('Please select at least one data type to export');
      return;
    }

    if (!exportOptions?.fileName?.trim()) {
      alert('Please enter a file name');
      return;
    }

    setIsExporting(true);
    
    try {
      const response = await fetch('/api/export/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...exportOptions,
          dateRange: {
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate
          }
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const result = await response.json();
      
      if (result.downloadUrl) {
        // Download the file
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = exportOptions.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Send email if specified
      if (exportOptions.emailTo && result.emailSent) {
        alert(`Export completed and sent to ${exportOptions.emailTo}`);
      } else {
        alert('Export completed successfully!');
      }
      
      onExport?.(exportOptions);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getEstimatedSize = () => {
    const totalSize = exportOptions?.dataTypes?.reduce((sum, type) => {
      return sum + (dataSizes?.[type] || 0);
    }, 0);
    
    return totalSize?.toFixed(1);
  };

  const selectedFormat = formatOptions?.find(opt => opt?.value === exportOptions?.format);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <Icon name="Download" size={24} className="mr-2" />
                Export Dashboard Data
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Export data from {format(dateRange?.startDate, 'MMM dd')} to {format(dateRange?.endDate, 'MMM dd, yyyy')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              iconName="X"
              iconSize={20}
              className="touch-feedback"
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formatOptions?.map((format) => (
                <div
                  key={format?.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    exportOptions?.format === format?.value
                      ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setExportOptions(prev => ({ ...prev, format: format?.value }))}
                >
                  <div className="flex items-start space-x-3">
                    <Icon name={format?.icon} size={20} className="mt-0.5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{format?.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format?.description}
                      </div>
                    </div>
                    {exportOptions?.format === format?.value && (
                      <Icon name="Check" size={16} className="text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Types */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">Data to Export</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllDataTypes}
                className="touch-feedback text-xs"
                disabled={loading}
              >
                {exportOptions?.dataTypes?.length === dataTypeOptions?.length ? 'Deselect' : 'Select'} All
              </Button>
            </div>
            
            <div className="space-y-3">
              {dataTypeOptions?.map((dataType) => (
                <div
                  key={dataType?.id}
                  className="flex items-start space-x-3 p-3 border border-border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={exportOptions?.dataTypes?.includes(dataType?.id)}
                    onChange={() => handleDataTypeToggle(dataType?.id)}
                    className="touch-feedback mt-0.5"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-foreground">{dataType?.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {loading ? (
                          <div className="animate-spin w-3 h-3 border border-muted-foreground border-t-transparent rounded-full" />
                        ) : (
                          dataType?.size
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {dataType?.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Export Options</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    File Name
                  </label>
                  <Input
                    value={exportOptions?.fileName}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      fileName: e?.target?.value 
                    }))}
                    placeholder="Enter file name..."
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email To (Optional)
                  </label>
                  <Input
                    type="email"
                    value={exportOptions?.emailTo}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      emailTo: e?.target?.value 
                    }))}
                    placeholder="email@example.com"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={exportOptions?.includeCharts}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeCharts: e?.target?.checked 
                    }))}
                    className="touch-feedback"
                  />
                  <label className="text-sm text-foreground">Include charts and graphs</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={exportOptions?.includeFilters}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeFilters: e?.target?.checked 
                    }))}
                    className="touch-feedback"
                  />
                  <label className="text-sm text-foreground">Include filter settings</label>
                </div>
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
              <Icon name="Info" size={16} className="mr-2" />
              Export Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Format:</div>
                <div className="font-medium text-foreground">
                  {selectedFormat?.label}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Data Types:</div>
                <div className="font-medium text-foreground">
                  {exportOptions?.dataTypes?.length} selected
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Estimated Size:</div>
                <div className="font-medium text-foreground">
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-3 h-3 border border-muted-foreground border-t-transparent rounded-full" />
                      <span>Calculating...</span>
                    </div>
                  ) : (
                    `~${getEstimatedSize()}MB`
                  )}
                </div>
              </div>
            </div>
            
            {exportOptions?.emailTo && (
              <div className="mt-3 text-xs text-muted-foreground">
                Export will be sent to: <span className="text-foreground font-medium">{exportOptions?.emailTo}</span>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border p-6 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {exportOptions?.dataTypes?.length === 0 
                ? 'Select data types to export'
                : `Ready to export ${exportOptions?.dataTypes?.length} data type${exportOptions?.dataTypes?.length > 1 ? 's' : ''}`
              }
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isExporting}
                className="touch-feedback"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || exportOptions?.dataTypes?.length === 0 || loading}
                iconName={isExporting ? undefined : "Download"}
                iconPosition="left"
                className="touch-feedback"
              >
                {isExporting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    <span>Exporting...</span>
                  </div>
                ) : (
                  'Export Data'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;