import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const DateRangeSelector = ({ 
  dateRange, 
  onChange,
  apiEndpoint = '/api/date-ranges',
  enablePresets = true,
  enableHistory = true,
  maxHistoryItems = 5,
  onError,
  autoApply = false, // Automatically apply changes without explicit apply button
  disabled = false
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedRanges, setSavedRanges] = useState([]);
  const [recentRanges, setRecentRanges] = useState([]);
  const [presets, setPresets] = useState([]);

  // Initialize custom dates when dateRange changes
  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      setCustomStart(format(new Date(dateRange.startDate), 'yyyy-MM-dd'));
      setCustomEnd(format(new Date(dateRange.endDate), 'yyyy-MM-dd'));
    }
  }, [dateRange]);

  // Default quick ranges
  const defaultQuickRanges = [
    {
      label: 'Today',
      key: 'today',
      getValue: () => ({
        startDate: new Date(),
        endDate: new Date()
      })
    },
    {
      label: 'Yesterday',
      key: 'yesterday',
      getValue: () => {
        const yesterday = subDays(new Date(), 1);
        return {
          startDate: yesterday,
          endDate: yesterday
        };
      }
    },
    {
      label: 'Last 7 Days',
      key: 'last7days',
      getValue: () => ({
        startDate: subDays(new Date(), 6),
        endDate: new Date()
      })
    },
    {
      label: 'This Week',
      key: 'thisweek',
      getValue: () => ({
        startDate: startOfWeek(new Date()),
        endDate: endOfWeek(new Date())
      })
    },
    {
      label: 'This Month',
      key: 'thismonth',
      getValue: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date())
      })
    },
    {
      label: 'Last 30 Days',
      key: 'last30days',
      getValue: () => ({
        startDate: subDays(new Date(), 29),
        endDate: new Date()
      })
    }
  ];

  // Fetch saved date ranges and presets from API
  const fetchDateRanges = useCallback(async () => {
    if (!enablePresets && !enableHistory) return;

    try {
      setLoading(true);
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

      const data = await response.json();
      
      // Expecting response format: { presets: [...], recent: [...] }
      if (data.presets && enablePresets) {
        setPresets(data.presets.map(preset => ({
          ...preset,
          getValue: () => ({
            startDate: new Date(preset.startDate),
            endDate: new Date(preset.endDate)
          })
        })));
      }

      if (data.recent && enableHistory) {
        setRecentRanges(data.recent.map(range => ({
          ...range,
          startDate: new Date(range.startDate),
          endDate: new Date(range.endDate)
        })));
      }

      if (data.saved) {
        setSavedRanges(data.saved.map(range => ({
          ...range,
          startDate: new Date(range.startDate),
          endDate: new Date(range.endDate)
        })));
      }

    } catch (err) {
      console.error('Error fetching date ranges:', err);
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, enablePresets, enableHistory, onError]);

  // Save date range to history
  const saveDateRangeToHistory = useCallback(async (range) => {
    if (!enableHistory) return;

    try {
      await fetch(`${apiEndpoint}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: range.startDate.toISOString(),
          endDate: range.endDate.toISOString(),
          label: `${format(range.startDate, 'MMM dd')} - ${format(range.endDate, 'MMM dd')}`
        }),
      });

      // Update local recent ranges
      setRecentRanges(current => {
        const newRange = {
          startDate: range.startDate,
          endDate: range.endDate,
          label: `${format(range.startDate, 'MMM dd')} - ${format(range.endDate, 'MMM dd')}`,
          createdAt: new Date()
        };
        
        // Remove duplicates and limit to maxHistoryItems
        const filtered = current.filter(r => 
          !(format(r.startDate, 'yyyy-MM-dd') === format(range.startDate, 'yyyy-MM-dd') &&
            format(r.endDate, 'yyyy-MM-dd') === format(range.endDate, 'yyyy-MM-dd'))
        );
        
        return [newRange, ...filtered].slice(0, maxHistoryItems);
      });

    } catch (err) {
      console.error('Error saving date range to history:', err);
    }
  }, [apiEndpoint, enableHistory, maxHistoryItems]);

  // Save custom date range as preset
  const saveAsPreset = async (name) => {
    if (!enablePresets || !dateRange) return;

    try {
      const response = await fetch(`${apiEndpoint}/presets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        }),
      });

      if (response.ok) {
        const newPreset = await response.json();
        setPresets(current => [...current, {
          ...newPreset,
          getValue: () => ({
            startDate: new Date(newPreset.startDate),
            endDate: new Date(newPreset.endDate)
          })
        }]);
        alert('Date range saved as preset!');
      }

    } catch (err) {
      console.error('Error saving preset:', err);
      alert('Failed to save preset');
    }
  };

  // Delete preset
  const deletePreset = async (presetId) => {
    try {
      const response = await fetch(`${apiEndpoint}/presets/${presetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPresets(current => current.filter(p => p.id !== presetId));
      }

    } catch (err) {
      console.error('Error deleting preset:', err);
      alert('Failed to delete preset');
    }
  };

  // Load initial data
  useEffect(() => {
    fetchDateRanges();
  }, [fetchDateRanges]);

  const handleQuickRange = async (range) => {
    if (disabled) return;
    
    const newRange = range?.getValue();
    onChange?.(newRange);
    setIsCustomMode(false);
    
    // Save to history
    await saveDateRangeToHistory(newRange);
  };

  const handleCustomRange = async () => {
    if (disabled) return;

    if (!customStart || !customEnd) {
      alert('Please select both start and end dates');
      return;
    }

    const startDate = new Date(customStart);
    const endDate = new Date(customEnd);
    
    if (!isValid(startDate) || !isValid(endDate)) {
      alert('Please enter valid dates');
      return;
    }

    if (startDate <= endDate) {
      const newRange = { startDate, endDate };
      onChange?.(newRange);
      setIsCustomMode(false);
      
      // Save to history
      await saveDateRangeToHistory(newRange);
    } else {
      alert('Start date must be before or equal to end date');
    }
  };

  const handleCustomDateChange = (field, value) => {
    if (field === 'start') {
      setCustomStart(value);
    } else {
      setCustomEnd(value);
    }

    // Auto-apply if enabled and both dates are set
    if (autoApply && customStart && customEnd) {
      const startDate = new Date(field === 'start' ? value : customStart);
      const endDate = new Date(field === 'end' ? value : customEnd);
      
      if (isValid(startDate) && isValid(endDate) && startDate <= endDate) {
        const newRange = { startDate, endDate };
        onChange?.(newRange);
      }
    }
  };

  const isActiveRange = (range) => {
    if (!dateRange?.startDate || !dateRange?.endDate) return false;
    
    const rangeValue = range?.getValue ? range.getValue() : range;
    return format(new Date(rangeValue?.startDate), 'yyyy-MM-dd') === format(new Date(dateRange?.startDate), 'yyyy-MM-dd') &&
           format(new Date(rangeValue?.endDate), 'yyyy-MM-dd') === format(new Date(dateRange?.endDate), 'yyyy-MM-dd');
  };

  const allQuickRanges = [...defaultQuickRanges, ...presets];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Calendar" size={20} className="mr-2" />
          Date Range
          {loading && (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary ml-2"></div>
          )}
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDateRanges}
            disabled={loading || disabled}
            iconName="RefreshCw"
            iconSize={14}
            className="touch-feedback"
            title="Refresh"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCustomMode(!isCustomMode)}
            disabled={disabled}
            iconName={isCustomMode ? "X" : "Settings"}
            iconSize={16}
            className="touch-feedback"
          >
            {isCustomMode ? 'Cancel' : 'Custom'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md">
          <div className="flex items-center text-error text-sm">
            <Icon name="AlertCircle" size={14} className="mr-2" />
            {error}
          </div>
        </div>
      )}

      {!isCustomMode ? (
        <div className="space-y-4">
          {/* Quick Ranges */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground mb-2">Quick Ranges</h4>
            {defaultQuickRanges?.map((range, index) => (
              <button
                key={index}
                onClick={() => handleQuickRange(range)}
                disabled={disabled}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors touch-feedback disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActiveRange(range)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {range?.label}
              </button>
            ))}
          </div>

          {/* Saved Presets */}
          {enablePresets && presets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground mb-2">Saved Presets</h4>
              {presets?.map((preset) => (
                <div key={preset.id} className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuickRange(preset)}
                    disabled={disabled}
                    className={`flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors touch-feedback disabled:opacity-50 ${
                      isActiveRange(preset)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {preset?.name || preset?.label}
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePreset(preset.id)}
                    disabled={disabled}
                    iconName="Trash2"
                    iconSize={12}
                    className="touch-feedback text-error hover:text-error p-1"
                    title="Delete preset"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Recent Ranges */}
          {enableHistory && recentRanges.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground mb-2">Recent Ranges</h4>
              {recentRanges?.map((range, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickRange(range)}
                  disabled={disabled}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors touch-feedback disabled:opacity-50 ${
                    isActiveRange(range)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{range?.label}</span>
                    <span className="text-xs opacity-75">
                      {range.createdAt && format(new Date(range.createdAt), 'MMM dd')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => handleCustomDateChange('start', e?.target?.value)}
              disabled={disabled}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => handleCustomDateChange('end', e?.target?.value)}
              disabled={disabled}
              className="w-full"
            />
          </div>
          
          {!autoApply && (
            <Button
              onClick={handleCustomRange}
              disabled={disabled}
              className="w-full touch-feedback"
              iconName="Check"
              iconPosition="left"
            >
              Apply Range
            </Button>
          )}

          {enablePresets && dateRange && (
            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  const name = prompt('Enter a name for this date range:');
                  if (name) saveAsPreset(name);
                }}
                disabled={disabled}
                className="w-full touch-feedback"
                iconName="Bookmark"
                iconPosition="left"
              >
                Save as Preset
              </Button>
            </div>
          )}
        </div>
      )}

      {dateRange?.startDate && dateRange?.endDate && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">Current Range:</div>
          <div className="text-sm font-medium text-foreground">
            {format(new Date(dateRange?.startDate), 'MMM dd, yyyy')} - {format(new Date(dateRange?.endDate), 'MMM dd, yyyy')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.ceil((new Date(dateRange?.endDate) - new Date(dateRange?.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="mt-4 text-xs text-muted-foreground flex items-center justify-between">
        <div>
          <Icon name="Info" size={12} className="inline mr-1" />
          Date range affects all dashboard data
        </div>
        {enableHistory && (
          <div className="flex items-center">
            <Icon name="History" size={12} className="mr-1" />
            Auto-saved to history
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeSelector;