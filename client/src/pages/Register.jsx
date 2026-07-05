import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldAlert, Key, Mail, User, Loader2 } from 'lucide-react';

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

    // Client-side validations
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const displayError = localError || apiError;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background gradients */}
      <div className="gradient-bg" />

      {/* Signup Form Container */}
      <div className="glass-panel w-full max-w-[420px] p-8 sm:p-10 animate-fade-in">
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4 animate-pulse-glow">
            <Activity size={24} className="text-white" />
          </div>
          <h2 className="text-title text-white mb-1.5 font-bold">Create Account</h2>
          <p className="text-caption text-gray-400 max-w-[280px]">
            Join MediTrack to easily organize and track family health records
          </p>
        </div>

        {/* Validation Errors Alert */}
        {displayError && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl mb-6 text-sm animate-scale-in">
            <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
            <span className="leading-normal">{displayError}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name input */}
          <div className="form-group mb-0">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <User size={16} />
              </span>
              <input
                type="text"
                id="name"
                className="form-input pl-11"
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                id="email"
                className="form-input pl-11"
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Key size={16} />
              </span>
              <input
                type="password"
                id="password"
                className="form-input pl-11"
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Key size={16} />
              </span>
              <input
                type="password"
                id="confirmPassword"
                className="form-input pl-11"
                placeholder="confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        {/* Redirect Footer */}
        <div className="mt-8 text-center text-sm text-gray-400 border-t border-dark-border pt-6">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="text-primary-400 font-semibold hover:text-primary-300 transition-colors duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
