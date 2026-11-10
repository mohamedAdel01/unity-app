import { ref } from 'vue';
import { useI18n } from './useI18n';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  createdAt: number;
}

// Global reactive state shared across the app
const toasts = ref<ToastItem[]>([]);

/**
 * Intelligent localized message cleaner that converts raw backend/Joi errors
 * into polished, user-friendly messages backed by t() translation dictionary.
 */
function formatErrorMessage(msg: string, t: (k: string) => string): { title?: string; message: string } {
  if (!msg) {
    return {
      title: t('Unexpected Error'),
      message: t('Please try again later or check your network connection.'),
    };
  }

  const lower = msg.toLowerCase();

  // Password length
  if (lower.includes('password') && (lower.includes('at least 6') || lower.includes('length') || lower.includes('short'))) {
    return {
      title: t('Password Too Short'),
      message: t('Password must be at least 6 characters long.'),
    };
  }

  // Email format
  if (lower.includes('email') && (lower.includes('valid') || lower.includes('format'))) {
    return {
      title: t('Invalid Email'),
      message: t('Please enter a valid email address such as name@example.com.'),
    };
  }

  // Phone validation
  if (
    lower.includes('phone') &&
    (lower.includes('required') ||
      lower.includes('valid') ||
      lower.includes('pattern') ||
      lower.includes('صحيح') ||
      lower.includes('10'))
  ) {
    return {
      title: t('Invalid Phone Number'),
      message: t('Please enter a valid 10-digit Saudi phone number starting with 05 (e.g. 05XXXXXXXX).'),
    };
  }

  // User exists / Phone already registered
  if (lower.includes('already exists') || lower.includes('already registered') || lower.includes('duplicate')) {
    return {
      title: t('Account Already Exists'),
      message: t('This phone number is already registered. Please log in instead.'),
    };
  }

  // Invalid login credentials
  if (
    lower.includes('invalid credentials') ||
    lower.includes('incorrect') ||
    lower.includes('invalid password') ||
    lower.includes('unauthorized')
  ) {
    return {
      title: t('Login Failed'),
      message: t('Invalid credentials. Please verify your phone number and password.'),
    };
  }

  // Not found
  if (lower.includes('not found') || lower.includes('غير موجود')) {
    return {
      title: t('Not Found'),
      message: t('The requested record or item was not found.'),
    };
  }

  const cleaned = msg
    .replace(/"name"/gi, t('Name'))
    .replace(/"email"/gi, t('Email'))
    .replace(/"password"/gi, t('Password'))
    .replace(/"phone"/gi, t('Phone number'));

  return { message: t(cleaned) };
}

export function useAppToast() {
  const { t } = useI18n();

  const show = (options: ToastOptions) => {
    const id = options.id || 'toast_' + Math.random().toString(36).substring(2, 9);
    const duration = options.duration ?? 4500;
    const type = options.type || 'info';

    // Pass message and title through i18n translation dictionary
    let message = t(options.message, options.message);
    let title = options.title ? t(options.title, options.title) : undefined;

    if (type === 'error') {
      const formatted = formatErrorMessage(options.message, t);
      if (!title && formatted.title) {
        title = formatted.title;
      }
      message = formatted.message;
    }

    const toastItem: ToastItem = {
      id,
      type,
      title,
      message,
      duration,
      createdAt: Date.now(),
    };

    // Prevent screen flood: keep at most 3 notifications visible
    if (toasts.value.length >= 3) {
      toasts.value.shift();
    }

    toasts.value.push(toastItem);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  };

  const error = (message: string, title?: string, duration?: number) => {
    return show({ type: 'error', message, title: title || t('Error'), duration });
  };

  const success = (message: string, title?: string, duration?: number) => {
    return show({ type: 'success', message, title: title || t('Success'), duration });
  };

  const warning = (message: string, title?: string, duration?: number) => {
    return show({ type: 'warning', message, title: title || t('Notice'), duration });
  };

  const info = (message: string, title?: string, duration?: number) => {
    return show({ type: 'info', message, title: title || t('Notification'), duration });
  };

  const remove = (id: string) => {
    const idx = toasts.value.findIndex(t => t.id === id);
    if (idx !== -1) {
      toasts.value.splice(idx, 1);
    }
  };

  const clear = () => {
    toasts.value = [];
  };

  return {
    toasts,
    show,
    error,
    success,
    warning,
    info,
    remove,
    clear,
  };
}
