import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserCircle, Mail, Shield, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">My Profile</h2>
        <p className="page-subtitle">View and manage your account settings</p>
      </div>

      <div className="max-w-form">
        <div className="glass-card">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-dark-border">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-heading font-bold text-2xl">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-title text-white">{user?.name || 'User'}</h3>
              <span className="badge badge-primary mt-1">{user?.role || 'User'}</span>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-body">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0">
                <UserCircle size={18} />
              </div>
              <div>
                <p className="text-caption text-gray-500">Full Name</p>
                <p className="text-white font-medium">{user?.name || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-body">
              <div className="w-10 h-10 rounded-xl bg-secondary-500/10 flex items-center justify-center text-secondary-400 flex-shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-caption text-gray-500">Email Address</p>
                <p className="text-white font-medium">{user?.email || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-body">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-caption text-gray-500">Account Role</p>
                <p className="text-white font-medium capitalize">{user?.role || 'user'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-body">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-caption text-gray-500">Member Since</p>
                <p className="text-white font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
