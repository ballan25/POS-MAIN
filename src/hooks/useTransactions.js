// src/hooks/useTransactions.js
import { useState, useEffect, useCallback } from 'react'
import { dbHelpers } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export const useTransactions = (filters = {}) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const loadTransactions = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await dbHelpers.getTransactions(filters)
      if (error) throw error
      
      setTransactions(data || [])
      setError(null)
    } catch (err) {
      console.error('Error loading transactions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, filters])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  useEffect(() => {
    if (!user) return

    // Subscribe to real-time updates
    const subscription = dbHelpers.subscribeToTransactions((payload) => {
      console.log('Real-time transaction update:', payload)
      
      switch (payload.eventType) {
        case 'INSERT':
          setTransactions(prev => [payload.new, ...prev])
          break
        case 'UPDATE':
          setTransactions(prev => prev.map(t => 
            t.id === payload.new.id ? payload.new : t
          ))
          break
        case 'DELETE':
          setTransactions(prev => prev.filter(t => t.id !== payload.old.id))
          break
        default:
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const createTransaction = async (transactionData) => {
    try {
      const { data, error } = await dbHelpers.createTransaction({
        ...transactionData,
        cashier_id: user.id,
        transaction_id: `TXN-${Date.now()}` // Simple ID for now
      })
      
      if (error) throw error
      
      // Transaction will be added via real-time subscription
      return { data, error: null }
    } catch (err) {
      console.error('Error creating transaction:', err)
      return { data: null, error: err }
    }
  }

  return {
    transactions,
    loading,
    error,
    refresh: loadTransactions,
    createTransaction
  }
}

// src/components/transactions/TransactionForm.jsx
import React, { useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions'

export const TransactionForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    items: [],
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    payment_method: 'cash',
    notes: ''
  })
  
  const [currentItem, setCurrentItem] = useState({
    name: '',
    quantity: 1,
    price: 0
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createTransaction } = useTransactions()

  const addItem = () => {
    if (!currentItem.name || currentItem.price <= 0) return
    
    const item = {
      ...currentItem,
      total: currentItem.quantity * currentItem.price
    }
    
    const newItems = [...formData.items, item]
    const newSubtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const newTaxAmount = newSubtotal * 0.1 // 10% tax
    const newTotal = newSubtotal + newTaxAmount - formData.discount_amount
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      subtotal: newSubtotal,
      tax_amount: newTaxAmount,
      total_amount: newTotal
    }))
    
    setCurrentItem({ name: '', quantity: 1, price: 0 })
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    const newSubtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const newTaxAmount = newSubtotal * 0.1
    const newTotal = newSubtotal + newTaxAmount - formData.discount_amount
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      subtotal: newSubtotal,
      tax_amount: newTaxAmount,
      total_amount: newTotal
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.items.length === 0) {
      alert('Please add at least one item')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const { data, error } = await createTransaction({
        ...formData,
        status: 'completed'
      })
      
      if (error) {
        alert('Error creating transaction: ' + error.message)
        return
      }
      
      // Reset form
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        items: [],
        subtotal: 0,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: 0,
        payment_method: 'cash',
        notes: ''
      })
      
      if (onSuccess) onSuccess(data)
      alert('Transaction created successfully!')
      
    } catch (err) {
      console.error('Transaction submission error:', err)
      alert('Error creating transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">New Transaction</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Phone
            </label>
            <input
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Add Items Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Add Items</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={currentItem.name}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentItem.price}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={addItem}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Item
              </button>
            </div>
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-3">Items in Transaction:</h4>
              <div className="bg-gray-50 rounded-md p-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600 ml-2">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">${item.total.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment & Total Section */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile Payment</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discount_amount}
                onChange={(e) => {
                  const discount = parseFloat(e.target.value) || 0
                  const newTotal = formData.subtotal + formData.tax_amount - discount
                  setFormData(prev => ({
                    ...prev,
                    discount_amount: discount,
                    total_amount: newTotal
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            />
          </div>

          {/* Transaction Summary */}
          <div className="bg-gray-50 p-4 rounded-md mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>${formData.tax_amount.toFixed(2)}</span>
              </div>
              {formData.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${formData.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${formData.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || formData.items.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Complete Transaction'}
          </button>
        </div>
      </form>
    </div>
  )
}

// src/components/transactions/TransactionList.jsx
export const TransactionList = ({ showFilters = true }) => {
  const [filters, setFilters] = useState({})
  const { transactions, loading, error } = useTransactions(filters)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        Error loading transactions: {error}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {showFilters && (
        <div className="p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="date"
              placeholder="Start Date"
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              placeholder="End Date"
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              onChange={(e) => setFilters(prev => ({ ...prev, payment_method: e.target.value || undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile Payment</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.transaction_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.customer_name || 'Walk-in Customer'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${transaction.total_amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {transaction.payment_method.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {transactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        )}
      </div>
    </div>
  )
} text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium
