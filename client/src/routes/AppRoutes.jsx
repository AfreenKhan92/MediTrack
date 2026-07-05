import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import Login from '../pages/Login';
import Register from '../pages/Register';

// Protected Pages
import Dashboard from '../pages/Dashboard';
import FamilyMembers from '../pages/FamilyMembers';
import Reports from '../pages/Reports';
import Appointments from '../pages/Appointments';
import Reminders from '../pages/Reminders';
import Vaccinations from '../pages/Vaccinations';
import Profile from '../pages/Profile';

// Auth guard wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-app">
        <div className="text-center animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-white font-heading font-bold">M</span>
          </div>
          <p className="text-sm text-gray-500">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />

      {/* Protected dashboard routes — nested under layout */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/family" element={<FamilyMembers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/vaccines" element={<Vaccinations />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
