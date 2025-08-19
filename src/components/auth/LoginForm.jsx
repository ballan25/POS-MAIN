// src/components/auth/LoginForm.jsx
import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const LoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
        return
      }

      if (onSuccess) {
        onSuccess(data)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your admin or cashier panel
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

// src/components/auth/ProtectedRoute.jsx
export const ProtectedRoute = ({ children, requiredRole = null, fallback = null }) => {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return fallback || <LoginForm />
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access this area.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your role: {userProfile?.role || 'Unknown'}
          </p>
        </div>
      </div>
    )
  }

  return children
}

// src/components/auth/RoleBasedComponent.jsx
export const RoleBasedComponent = ({ 
  adminComponent, 
  cashierComponent, 
  allowedRoles = [], 
  children 
}) => {
  const { userProfile } = useAuth()
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
    return null
  }

  if (userProfile?.role === 'admin' && adminComponent) {
    return adminComponent
  }
  
  if (userProfile?.role === 'cashier' && cashierComponent) {
    return cashierComponent
  }
  
  return children || null
}

// src/components/common/Header.jsx
export const Header = () => {
  const { user, userProfile, signOut } = useAuth()

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {userProfile?.role === 'admin' ? 'Admin Panel' : 'Cashier Panel'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{userProfile?.full_name || user?.email}</span>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {userProfile?.role}
              </span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default LoginForm
