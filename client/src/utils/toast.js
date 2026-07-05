import { toast } from 'react-hot-toast';

// Custom dark mode theme configurations for react-hot-toast
const toastStyle = {
  style: {
    background: '#111827',
    color: '#f9fafb',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    padding: '12px 16px',
  },
  success: {
    iconTheme: {
      primary: '#10b981', // emerald-500
      secondary: '#111827',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444', // red-500
      secondary: '#111827',
    },
  },
};

export const showToast = {
  success: (message) => {
    toast.success(message, {
      ...toastStyle,
      ...toastStyle.success,
    });
  },

  error: (message) => {
    toast.error(message, {
      ...toastStyle,
      ...toastStyle.error,
    });
  },

  info: (message) => {
    toast(message, {
      ...toastStyle,
      icon: 'ℹ️',
    });
  },

  promise: (promise, { loading, success, error }) => {
    return toast.promise(
      promise,
      {
        loading: loading || 'Loading...',
        success: success || 'Success!',
        error: (err) => error || err.message || 'An error occurred',
      },
      {
        style: toastStyle.style,
        success: toastStyle.success,
        error: toastStyle.error,
      }
    );
  },
};

export default showToast;
