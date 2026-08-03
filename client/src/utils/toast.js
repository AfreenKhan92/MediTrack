import { toast } from 'react-hot-toast';

// Minimal light-mode monochrome theme for react-hot-toast
const toastStyle = {
  style: {
    background: '#ffffff',
    color: '#111827',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
    padding: '12px 16px',
    maxWidth: '420px',
  },
  success: {
    duration: 3500,
    iconTheme: {
      primary: '#111827', // Crisp black checkmark
      secondary: '#ffffff',
    },
  },
  error: {
    duration: 4500,
    iconTheme: {
      primary: '#dc2626', // Red indicator for error
      secondary: '#ffffff',
    },
  },
};

export const showToast = {
  success: (message) => {
    return toast.success(message, {
      ...toastStyle,
      ...toastStyle.success,
    });
  },

  error: (message) => {
    return toast.error(message, {
      ...toastStyle,
      ...toastStyle.error,
    });
  },

  info: (message) => {
    return toast(message, {
      ...toastStyle,
      icon: 'ℹ️',
      duration: 3500,
    });
  },

  warning: (message) => {
    return toast(message, {
      ...toastStyle,
      icon: '⚠️',
      duration: 4000,
    });
  },

  loading: (message) => {
    return toast.loading(message || 'Processing...', {
      ...toastStyle,
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  promise: (promise, { loading, success, error }) => {
    return toast.promise(
      promise,
      {
        loading: loading || 'Loading...',
        success: success || 'Success!',
        error: (err) => (typeof error === 'function' ? error(err) : error || err?.message || 'An error occurred'),
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
