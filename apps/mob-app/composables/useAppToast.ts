import { ref } from 'vue';
import { useI18n } from './useI18n';

export interface ToastOptions {
  id?: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: 'error' | 'success' | 'warning' | 'info';
  createdAt: number;
}

// Global reactive state shared across the app
const toasts = ref<ToastItem[]>([]);

/**
 * Intelligent bilingual message cleaner that converts raw backend/Joi errors
 * into polished, user-friendly localized messages in Arabic or English based on active locale.
 */
function formatErrorMessage(msg: string, isRtl: boolean): { title?: string; message: string } {
  if (!msg) {
    return isRtl
      ? {
          title: 'حدث خطأ غير متوقع',
          message: 'يرجى إعادة المحاولة لاحقاً أو التحقق من اتصالك بالإنترنت.',
        }
      : {
          title: 'Unexpected Error',
          message: 'Please try again later or check your network connection.',
        };
  }

  const lower = msg.toLowerCase();

  // Password length
  if (lower.includes('password') && (lower.includes('at least 6') || lower.includes('length') || lower.includes('short'))) {
    return isRtl
      ? {
          title: 'كلمة المرور قصيرة',
          message: 'يجب أن تتكون كلمة المرور من 6 خانات أو أحرف على الأقل.',
        }
      : {
          title: 'Password Too Short',
          message: 'Password must be at least 6 characters long.',
        };
  }

  // Email format
  if (lower.includes('email') && (lower.includes('valid') || lower.includes('format'))) {
    return isRtl
      ? {
          title: 'بريد إلكتروني غير صحيح',
          message: 'يرجى كتابة عنوان بريد إلكتروني صالح مثل: name@example.com',
        }
      : {
          title: 'Invalid Email',
          message: 'Please enter a valid email address such as name@example.com.',
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
    return isRtl
      ? {
          title: 'رقم جوال غير صالح',
          message: 'يرجى إدخال رقم جوال سعودي يبدأ بـ 05 ويتكون من 10 أرقام (مثال: 05XXXXXXXX).',
        }
      : {
          title: 'Invalid Phone Number',
          message: 'Please enter a valid 10-digit Saudi phone number starting with 05 (e.g. 05XXXXXXXX).',
        };
  }

  // User exists / Phone already registered
  if (lower.includes('already exists') || lower.includes('already registered') || lower.includes('duplicate')) {
    return isRtl
      ? {
          title: 'الحساب مسجل مسبقاً',
          message: 'رقم الجوال مسجل بالفعل. يمكنك تسجيل الدخول بدلاً من ذلك.',
        }
      : {
          title: 'Account Already Exists',
          message: 'This phone number is already registered. Please log in instead.',
        };
  }

  // Invalid login credentials
  if (
    lower.includes('invalid credentials') ||
    lower.includes('incorrect') ||
    lower.includes('invalid password') ||
    lower.includes('unauthorized')
  ) {
    return isRtl
      ? {
          title: 'تعذر تسجيل الدخول',
          message: 'بيانات الدخول غير صحيحة، يرجى التأكد من رقم الجوال وكلمة المرور.',
        }
      : {
          title: 'Login Failed',
          message: 'Invalid credentials. Please verify your phone number and password.',
        };
  }

  // Not found
  if (lower.includes('not found') || lower.includes('غير موجود')) {
    return isRtl
      ? {
          title: 'غير موجود',
          message: 'العنصر أو السجل المطلوب غير موجود.',
        }
      : {
          title: 'Not Found',
          message: 'The requested record or item was not found.',
        };
  }

  // Clean raw quotation marks around fields
  if (isRtl) {
    const cleaned = msg
      .replace(/"name"/gi, 'الاسم')
      .replace(/"email"/gi, 'البريد الإلكتروني')
      .replace(/"password"/gi, 'كلمة المرور')
      .replace(/"phone"/gi, 'رقم الجوال');
    return { message: cleaned };
  } else {
    const cleaned = msg
      .replace(/"name"/gi, 'Name')
      .replace(/"email"/gi, 'Email')
      .replace(/"password"/gi, 'Password')
      .replace(/"phone"/gi, 'Phone number');
    return { message: cleaned };
  }
}

export function useAppToast() {
  const { t, isRtl } = useI18n();

  const show = (options: ToastOptions) => {
    const id = options.id || 'toast_' + Math.random().toString(36).substring(2, 9);
    const duration = options.duration ?? 4500;
    const type = options.type || 'info';

    // Pass message and title through i18n translation dictionary
    let message = t(options.message, options.message);
    let title = options.title ? t(options.title, options.title) : undefined;

    if (type === 'error') {
      const formatted = formatErrorMessage(options.message, isRtl.value);
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
    const defaultTitle = isRtl.value ? 'خطأ' : 'Error';
    return show({ type: 'error', message, title: title || defaultTitle, duration });
  };

  const success = (message: string, title?: string, duration?: number) => {
    const defaultTitle = isRtl.value ? 'تمت العملية بنجاح' : 'Success';
    return show({ type: 'success', message, title: title || defaultTitle, duration });
  };

  const warning = (message: string, title?: string, duration?: number) => {
    const defaultTitle = isRtl.value ? 'تنبيه مهم' : 'Notice';
    return show({ type: 'warning', message, title: title || defaultTitle, duration });
  };

  const info = (message: string, title?: string, duration?: number) => {
    const defaultTitle = isRtl.value ? 'إشعار' : 'Notification';
    return show({ type: 'info', message, title: title || defaultTitle, duration });
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
