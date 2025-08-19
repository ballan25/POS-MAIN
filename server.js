// server.js - Main Express server with Supabase and WebSocket support
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Global state for tracking connections and system status
let adminConnections = new Set();
let systemStatus = {
  supabase: 'connected',
  mpesa: 'connected',
  lastUpdated: new Date()
};

// Real-time subscription references
let transactionSubscription = null;
let alertSubscription = null;

// Utility function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Utility function to get date range for comparisons
const getDateRanges = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  
  // Previous period for comparison
  const prevEnd = new Date(start - 1);
  const prevStart = new Date(prevEnd - diffTime);
  
  return {
    current: { start, end },
    previous: { start: prevStart, end: prevEnd }
  };
};

// KPI Calculation Functions
const calculateDailyKPIs = async (startDate, endDate) => {
  try {
    const dateRanges = getDateRanges(startDate, endDate);
    
    // Fetch current period transactions
    const { data: currentTransactions, error: currentError } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', dateRanges.current.start.toISOString())
      .lte('created_at', dateRanges.current.end.toISOString())
      .eq('status', 'completed');
    
    if (currentError) throw currentError;
    
    // Fetch previous period for comparison
    const { data: previousTransactions, error: previousError } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', dateRanges.previous.start.toISOString())
      .lte('created_at', dateRanges.previous.end.toISOString())
      .eq('status', 'completed');
    
    if (previousError) throw previousError;
    
    // Process current period data
    let currentRevenue = 0;
    let currentTransactionCount = currentTransactions?.length || 0;
    let mpesaCount = 0;
    let cashCount = 0;
    
    if (currentTransactions) {
      currentTransactions.forEach(transaction => {
        currentRevenue += transaction.total || 0;
        
        if (transaction.payment_method === 'M-Pesa' || transaction.payment_method === 'mpesa') {
          mpesaCount++;
        } else if (transaction.payment_method === 'Cash' || transaction.payment_method === 'cash') {
          cashCount++;
        }
      });
    }
    
    // Process previous period data
    let previousRevenue = 0;
    let previousTransactionCount = previousTransactions?.length || 0;
    
    if (previousTransactions) {
      previousTransactions.forEach(transaction => {
        previousRevenue += transaction.total || 0;
      });
    }
    
    // Calculate metrics
    const averageOrderValue = currentTransactionCount > 0 ? currentRevenue / currentTransactionCount : 0;
    const previousAverageOrderValue = previousTransactionCount > 0 ? previousRevenue / previousTransactionCount : 0;
    
    const mpesaRatio = currentTransactionCount > 0 ? (mpesaCount / currentTransactionCount) * 100 : 0;
    const cashRatio = currentTransactionCount > 0 ? (cashCount / currentTransactionCount) * 100 : 0;
    
    // Calculate percentage changes
    const dailyRevenueChange = calculatePercentageChange(currentRevenue, previousRevenue);
    const transactionCountChange = calculatePercentageChange(currentTransactionCount, previousTransactionCount);
    const averageOrderValueChange = calculatePercentageChange(averageOrderValue, previousAverageOrderValue);
    
    return {
      dailyRevenue: parseFloat(currentRevenue.toFixed(2)),
      dailyRevenueChange: parseFloat(dailyRevenueChange.toFixed(1)),
      transactionCount: currentTransactionCount,
      transactionCountChange: parseFloat(transactionCountChange.toFixed(1)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      averageOrderValueChange: parseFloat(averageOrderValueChange.toFixed(1)),
      mpesaRatio: parseFloat(mpesaRatio.toFixed(1)),
      mpesaRatioChange: 0, // You can implement historical comparison for this
      cashRatio: parseFloat(cashRatio.toFixed(1)),
      lastCalculated: new Date()
    };
    
  } catch (error) {
    console.error('Error calculating KPIs:', error);
    throw error;
  }
};

// API Routes

// Dashboard KPI endpoint
app.get('/api/admin/dashboard/kpi', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'startDate and endDate query parameters are required' 
      });
    }
    
    const kpi = await calculateDailyKPIs(new Date(startDate), new Date(endDate));
    
    res.json(kpi);
  } catch (error) {
    console.error('KPI calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate KPIs',
      details: error.message 
    });
  }
});

// Recent transactions endpoint
app.get('/api/admin/transactions/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id,
        created_at,
        total,
        payment_method,
        cashier_name,
        items,
        status
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    const formattedTransactions = transactions?.map(transaction => ({
      id: transaction.id,
      timestamp: transaction.created_at,
      amount: transaction.total || 0,
      method: transaction.payment_method || 'Unknown',
      cashier: transaction.cashier_name || 'Unknown',
      items: Array.isArray(transaction.items) 
        ? transaction.items.map(item => `${item.name} ${item.size ? `(${item.size})` : ''}`).join(', ')
        : transaction.items || 'No items',
      status: transaction.status || 'completed'
    })) || [];
    
    res.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent transactions',
      details: error.message 
    });
  }
});

// Active alerts endpoint
app.get('/api/admin/alerts/active', async (req, res) => {
  try {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    const formattedAlerts = alerts?.map(alert => ({
      id: alert.id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity || 'medium',
      timestamp: alert.created_at
    })) || [];
    
    res.json({ alerts: formattedAlerts });
  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch alerts',
      details: error.message 
    });
  }
});

// System status endpoint
app.get('/api/admin/system/status', async (req, res) => {
  try {
    // Check Supabase connection
    try {
      const { error } = await supabase.from('transactions').select('id').limit(1);
      systemStatus.supabase = error ? 'error' : 'connected';
    } catch (err) {
      systemStatus.supabase = 'error';
    }
    
    // Check M-Pesa API (implement your M-Pesa health check here)
    systemStatus.mpesa = 'connected'; // Placeholder
    systemStatus.lastUpdated = new Date();
    
    res.json(systemStatus);
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({ 
      error: 'Failed to check system status',
      details: error.message 
    });
  }
});

// Export data endpoint
app.get('/api/admin/export/dashboard', async (req, res) => {
  try {
    const { format, startDate, endDate } = req.query;
    
    if (!format || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'format, startDate, and endDate are required' 
      });
    }
    
    // Fetch transaction data for export
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', new Date(startDate).toISOString())
      .lte('created_at', new Date(endDate).toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (format === 'csv') {
      // Generate CSV
      const csv = generateCSV(transactions || []);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="sales-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else if (format === 'pdf') {
      // For PDF, you would implement PDF generation here
      res.status(501).json({ error: 'PDF export not yet implemented' });
    } else {
      res.status(400).json({ error: 'Unsupported format' });
    }
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export data',
      details: error.message 
    });
  }
});

// CSV generation utility
const generateCSV = (transactions) => {
  const headers = ['Transaction ID', 'Date', 'Time', 'Total (KES)', 'Payment Method', 'Cashier', 'Items', 'Status'];
  const csvRows = [headers.join(',')];
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.created_at);
    let items = '';
    
    if (Array.isArray(transaction.items)) {
      items = transaction.items.map(item => `${item.name} (${item.quantity || 1})`).join('; ');
    } else if (typeof transaction.items === 'string') {
      items = transaction.items;
    }
    
    const row = [
      transaction.id,
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      transaction.total || 0,
      transaction.payment_method || 'Unknown',
      transaction.cashier_name || 'Unknown',
      `"${items}"`, // Wrap in quotes to handle commas in items
      transaction.status || 'completed'
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

// Detailed analytics endpoint
app.get('/api/admin/analytics/detailed', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'startDate and endDate are required' 
      });
    }
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', new Date(startDate).toISOString())
      .lte('created_at', new Date(endDate).toISOString())
      .eq('status', 'completed')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Group data by specified period
    const groupedData = {};
    const hourlyData = {};
    const paymentMethodData = { 'M-Pesa': 0, 'Cash': 0 };
    const cashierData = {};
    const itemsData = {};
    
    transactions?.forEach(transaction => {
      const timestamp = new Date(transaction.created_at);
      const total = transaction.total || 0;
      
      // Group by day/week/month
      let groupKey;
      if (groupBy === 'hour') {
        groupKey = timestamp.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      } else if (groupBy === 'day') {
        groupKey = timestamp.toISOString().slice(0, 10); // YYYY-MM-DD
      } else if (groupBy === 'week') {
        const weekStart = new Date(timestamp);
        weekStart.setDate(timestamp.getDate() - timestamp.getDay());
        groupKey = weekStart.toISOString().slice(0, 10);
      } else if (groupBy === 'month') {
        groupKey = timestamp.toISOString().slice(0, 7); // YYYY-MM
      }
      
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          date: groupKey,
          revenue: 0,
          transactions: 0,
          avgOrderValue: 0
        };
      }
      
      groupedData[groupKey].revenue += total;
      groupedData[groupKey].transactions += 1;
      
      // Hourly analysis
      const hour = timestamp.getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { hour, revenue: 0, transactions: 0 };
      }
      hourlyData[hour].revenue += total;
      hourlyData[hour].transactions += 1;
      
      // Payment method analysis
      const paymentMethod = transaction.payment_method;
      if (paymentMethodData[paymentMethod] !== undefined) {
        paymentMethodData[paymentMethod] += total;
      }
      
      // Cashier performance
      const cashier = transaction.cashier_name;
      if (cashier) {
        if (!cashierData[cashier]) {
          cashierData[cashier] = { name: cashier, revenue: 0, transactions: 0 };
        }
        cashierData[cashier].revenue += total;
        cashierData[cashier].transactions += 1;
      }
      
      // Item analysis
      if (transaction.items && Array.isArray(transaction.items)) {
        transaction.items.forEach(item => {
          const itemKey = `${item.name}${item.size ? ` (${item.size})` : ''}`;
          if (!itemsData[itemKey]) {
            itemsData[itemKey] = { 
              name: itemKey, 
              quantity: 0, 
              revenue: 0,
              avgPrice: 0
            };
          }
          itemsData[itemKey].quantity += item.quantity || 1;
          itemsData[itemKey].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });
    
    // Calculate averages for grouped data
    Object.values(groupedData).forEach(group => {
      group.avgOrderValue = group.transactions > 0 ? group.revenue / group.transactions : 0;
    });
    
    // Calculate percentage changes
    const currentRevenue = Object.values(groupedData).reduce((sum, group) => sum + group.revenue, 0);
    const currentCount = Object.values(groupedData).reduce((sum, group) => sum + group.transactions, 0);
    const previousRevenue = (previousTransactions || []).reduce((sum, t) => sum + (t.total || 0), 0);
    const previousCount = previousTransactions?.length || 0;
    
    const avgOrderValue = currentCount > 0 ? currentRevenue / currentCount : 0;
    const prevAvgOrderValue = previousCount > 0 ? previousRevenue / previousCount : 0;
    
    return {
      dailyRevenue: parseFloat(currentRevenue.toFixed(2)),
      dailyRevenueChange: parseFloat(calculatePercentageChange(currentRevenue, previousRevenue).toFixed(1)),
      transactionCount: currentCount,
      transactionCountChange: parseFloat(calculatePercentageChange(currentCount, previousCount).toFixed(1)),
      averageOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      averageOrderValueChange: parseFloat(calculatePercentageChange(avgOrderValue, prevAvgOrderValue).toFixed(1)),
      mpesaRatio: parseFloat(((mpesaCount / Math.max(currentCount, 1)) * 100).toFixed(1)),
      mpesaRatioChange: 0,
      cashRatio: parseFloat(((cashCount / Math.max(currentCount, 1)) * 100).toFixed(1)),
      lastCalculated: new Date()
    };
    
  } catch (error) {
    console.error('Error calculating KPIs:', error);
    throw error;
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Handle admin dashboard connections
  socket.on('join-admin-dashboard', () => {
    socket.join('admin-dashboard');
    adminConnections.add(socket.id);
    console.log('Admin client joined dashboard room');
    
    // Send initial system status
    socket.emit('system-status', systemStatus);
  });
  
  socket.on('disconnect', () => {
    adminConnections.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

// Setup Supabase real-time listeners
const setupSupabaseListeners = () => {
  console.log('🔌 Setting up Supabase real-time listeners...');
  
  // Listen for new transactions
  transactionSubscription = supabase
    .channel('transactions-channel')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'transactions' 
      }, 
      (payload) => {
        console.log('New transaction detected:', payload.new.id);
        
        const transaction = {
          id: payload.new.id,
          timestamp: payload.new.created_at,
          amount: payload.new.total || 0,
          method: payload.new.payment_method || 'Unknown',
          cashier: payload.new.cashier_name || 'Unknown',
          items: Array.isArray(payload.new.items) 
            ? payload.new.items.map(item => `${item.name} ${item.size ? `(${item.size})` : ''}`).join(', ')
            : payload.new.items || 'No items',
          status: payload.new.status || 'completed'
        };
        
        // Broadcast to all admin clients
        io.to('admin-dashboard').emit('transaction-update', {
          type: 'NEW_TRANSACTION',
          transaction
        });
      }
    )
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions'
      },
      (payload) => {
        console.log('Transaction updated:', payload.new.id);
        
        // Broadcast KPI recalculation trigger
        broadcastKPIUpdate();
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Transactions real-time listener active');
        systemStatus.supabase = 'connected';
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Transactions listener error');
        systemStatus.supabase = 'error';
      }
      
      // Broadcast system status update
      io.to('admin-dashboard').emit('system-status', systemStatus);
    });
  
  // Listen for alerts
  alertSubscription = supabase
    .channel('alerts-channel')
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts'
      },
      (payload) => {
        if (payload.new.is_active) {
          console.log('New alert detected:', payload.new.id);
          
          const alert = {
            id: payload.new.id,
            title: payload.new.title,
            message: payload.new.message,
            severity: payload.new.severity || 'medium',
            timestamp: payload.new.created_at
          };
          
          io.to('admin-dashboard').emit('alert-update', {
            type: 'ALERT',
            alert
          });
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Alerts real-time listener active');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Alerts listener error');
      }
    });
};

// KPI recalculation and broadcasting
const broadcastKPIUpdate = async () => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate - 24 * 60 * 60 * 1000); // Last 24 hours
    
    const kpi = await calculateDailyKPIs(startDate, endDate);
    
    io.to('admin-dashboard').emit('kpi-update', {
      type: 'KPI_UPDATE',
      kpi
    });
    
    console.log('📊 KPI update broadcasted');
  } catch (error) {
    console.error('KPI broadcast error:', error);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    systemStatus,
    activeConnections: adminConnections.size
  });
});

// Middleware for admin authentication (implement your auth logic)
const requireAdminAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    req.userProfile = profile;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Apply admin auth to all admin routes (comment out for development)
// app.use('/api/admin', requireAdminAuth);

// Test endpoint to create sample transactions (for development)
app.post('/api/test/create-transaction', async (req, res) => {
  try {
    const sampleTransaction = {
      total: Math.floor(Math.random() * 1000) + 100,
      payment_method: Math.random() > 0.6 ? 'M-Pesa' : 'Cash',
      cashier_name: ['Sarah Johnson', 'Mike Chen', 'Lucy Wanjiku'][Math.floor(Math.random() * 3)],
      items: [
        { name: 'Classic Milk Tea', size: 'Large', quantity: 1, price: 320 },
        { name: 'Tapioca Pearls', quantity: 1, price: 50 }
      ],
      status: 'completed',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([sampleTransaction])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      transactionId: data.id,
      message: 'Test transaction created successfully',
      transaction: data
    });
  } catch (error) {
    console.error('Test transaction creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create test transaction',
      details: error.message 
    });
  }
});

// Test endpoint to create sample alert
app.post('/api/test/create-alert', async (req, res) => {
  try {
    const sampleAlert = {
      title: 'System Alert',
      message: 'This is a test alert from the admin dashboard',
      severity: 'medium',
      is_active: true,
      created_by: 'system',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('alerts')
      .insert([sampleAlert])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      alertId: data.id,
      message: 'Test alert created successfully',
      alert: data
    });
  } catch (error) {
    console.error('Test alert creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create test alert',
      details: error.message 
    });
  }
});

// Get all transactions with pagination
app.get('/api/admin/transactions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    const { data: transactions, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    res.json({
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server and setup listeners
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Admin Dashboard API server running on port ${PORT}`);
  console.log(`📊 Dashboard endpoints available at http://localhost:${PORT}/api/admin`);
  console.log(`🔌 WebSocket server ready for real-time updates`);
  console.log(`🗄️  Connected to Supabase: ${supabaseUrl}`);
  
  // Setup Supabase real-time listeners
  setupSupabaseListeners();
  
  // Broadcast KPI updates every 5 minutes
  setInterval(broadcastKPIUpdate, 5 * 60 * 1000);
  
  console.log('✅ Real-time listeners initialized');
});

// Graceful shutdown
const cleanup = () => {
  console.log('🛑 Shutting down gracefully...');
  
  // Close Supabase subscriptions
  if (transactionSubscription) {
    supabase.removeChannel(transactionSubscription);
  }
  if (alertSubscription) {
    supabase.removeChannel(alertSubscription);
  }
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

module.exports = { app, server, io, supabase };
