import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserCircle, Mail, Shield, Calendar } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h2 className="page-title text-gray-900 font-bold">My Profile</h2>
        <p className="page-subtitle text-gray-500">View and manage your account settings</p>
      </div>

      <div className="max-w-form">
        <Card className="space-y-6">
          {/* Avatar & Header */}
          <div className="flex items-center gap-4 pb-5 border-b border-gray-200">
            <div className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center font-bold text-headline">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-subtitle font-bold text-gray-900">{user?.name || 'User'}</h3>
              <Badge variant="secondary" className="mt-1">{user?.role || 'User'}</Badge>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900 flex-shrink-0">
                <UserCircle size={18} />
              </div>
              <div>
                <p className="text-caption text-gray-400 font-semibold uppercase tracking-wider">Full Name</p>
                <p className="text-body text-gray-900 font-medium">{user?.name || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900 flex-shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-caption text-gray-400 font-semibold uppercase tracking-wider">Email Address</p>
                <p className="text-body text-gray-900 font-medium">{user?.email || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900 flex-shrink-0">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-caption text-gray-400 font-semibold uppercase tracking-wider">Account Role</p>
                <p className="text-body text-gray-900 font-medium capitalize">{user?.role || 'user'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900 flex-shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-caption text-gray-400 font-semibold uppercase tracking-wider">Member Since</p>
                <p className="text-body text-gray-900 font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
