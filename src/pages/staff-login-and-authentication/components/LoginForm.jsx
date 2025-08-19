import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ onLogin, isLoading, error, attemptCount }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors?.[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password?.trim()) {
      errors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onLogin(formData);
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Input */}
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData?.email}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter your work email"
        error={validationErrors?.email}
        required
        disabled={isLoading}
        className="text-lg"
      />
      {/* Password Input */}
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData?.password}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter your password"
          error={validationErrors?.password}
          required
          disabled={isLoading}
          className="text-lg pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 p-2 text-muted-foreground hover:text-foreground transition-colors touch-feedback"
          disabled={isLoading}
          tabIndex={-1}
        >
          <Icon 
            name={showPassword ? 'EyeOff' : 'Eye'} 
            size={20} 
          />
        </button>
      </div>
      {/* Remember Me Checkbox */}
      <Checkbox
        label="Remember me on this device"
        name="rememberMe"
        checked={formData?.rememberMe}
        onChange={handleInputChange}
        disabled={isLoading}
        description="Stay logged in for faster access during shifts"
      />
      {/* Error Display */}
      {error && (
        <div className="flex items-center p-4 bg-error/10 border border-error/20 rounded-lg">
          <Icon name="AlertCircle" size={20} className="text-error mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-error">
              {error}
            </p>
            {attemptCount > 0 && (
              <p className="text-xs text-error/80 mt-1">
                Failed attempts: {attemptCount}/5
              </p>
            )}
          </div>
        </div>
      )}
      {/* Login Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={isLoading || attemptCount >= 5}
        iconName="LogIn"
        iconPosition="right"
        className="text-lg h-14 touch-feedback"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
      {/* Lockout Warning */}
      {attemptCount >= 3 && attemptCount < 5 && (
        <div className="flex items-center p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <Icon name="Shield" size={18} className="text-warning mr-2" />
          <p className="text-sm text-warning">
            Account will be temporarily locked after {5 - attemptCount} more failed attempts
          </p>
        </div>
      )}
    </form>
  );
};

export default LoginForm;