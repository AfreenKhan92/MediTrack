import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldAlert, Key, Mail, User } from 'lucide-react';
import { showToast } from '../utils/toast';
import Button from '../components/Button';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const { register, error: apiError, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password.length < 6) {
      const errMsg = 'Password must be at least 6 characters long';
      setLocalError(errMsg);
      showToast.error(errMsg);
      return;
    }

    if (password !== confirmPassword) {
      const errMsg = 'Passwords do not match';
      setLocalError(errMsg);
      showToast.error(errMsg);
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      showToast.success('Account created successfully! Welcome to MediTrack.');
      navigate('/dashboard');
    } else {
      showToast.error('Registration failed. Please try again.');
    }
  };

  const displayError = localError || apiError;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Signup Form Container */}
      <div className="bg-white border border-gray-200 shadow-md rounded-xl w-full max-w-[400px] p-8 sm:p-10 animate-fade-in">
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-3">
            <Activity size={20} />
          </div>
          <h2 className="text-subtitle font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-caption text-gray-500 max-w-[280px]">
            Join MediTrack to easily organize and track family health records
          </p>
        </div>

        {/* Validation Errors Alert */}
        {displayError && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-5 text-caption animate-scale-in font-medium">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <span className="leading-normal">{displayError}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name input */}
          <div className="form-group mb-0">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={15} />
              </span>
              <input
                type="text"
                id="name"
                className="form-input pl-10"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email input */}
          <div className="form-group mb-0">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={15} />
              </span>
              <input
                type="email"
                id="email"
                className="form-input pl-10"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password input */}
          <div className="form-group mb-0">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Key size={15} />
              </span>
              <input
                type="password"
                id="password"
                className="form-input pl-10"
                placeholder="min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="form-group mb-0">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Key size={15} />
              </span>
              <input
                type="password"
                id="confirmPassword"
                className="form-input pl-10"
                placeholder="confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full py-3 mt-2"
          >
            Register Account
          </Button>
        </form>

        {/* Redirect Footer */}
        <div className="mt-6 text-center text-caption text-gray-500 border-t border-gray-100 pt-5">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="text-gray-900 font-bold hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
