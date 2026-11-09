import { ref } from 'vue';

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
 * Intelligent message cleaner that converts raw backend/Joi errors
 * into polished, user-friendly localized messages.
 */
function formatErrorMessage(msg: string): { title?: string; message: string } {
  if (!msg) {
    return { 
      title: 'حدث خطأ غير متوقع', 
      message: 'يرجى إعادة المحاولة لاحقاً أو التحقق من اتصالك بالإنترنت.' 
    };
  }

  // Password length
  if (msg.includes('password') && (msg.includes('at least 6') || msg.includes('length'))) {
    return {
      title: 'كلمة المرور قصيرة',
      message: 'يجب أن تتكون كلمة المرور من 6 خانات أو أحرف على الأقل.',
    };
  }

  // Email format
  if (msg.includes('email') && msg.includes('valid')) {
    return {
      title: 'بريد إلكتروني غير صحيح',
      message: 'يرجى كتابة عنوان بريد إلكتروني صالح مثل: name@example.com',
    };
  }

  // Phone validation
  if (msg.includes('phone') && (msg.includes('required') || msg.includes('valid') || msg.includes('pattern') || msg.includes('صحيح'))) {
    return {
      title: 'رقم جوال غير صالح',
      message: 'يرجى إدخال رقم جوال يبدأ بـ 05 ويتكون من 10 أرقام (مثال: 05XXXXXXXX).',
    };
  }

  // User exists
  if (msg.includes('already exists') || msg.includes('already registered')) {
    return {
      title: 'الحساب مسجل مسبقاً',
      message: 'رقم الجوال مسجل بالفعل. يمكنك تسجيل الدخول بدلاً من ذلك.',
    };
  }

  // Invalid login credentials
  if (msg.includes('Invalid credentials') || msg.includes('Incorrect') || msg.includes('not found')) {
    return {
      title: 'تعذر تسجيل الدخول',
      message: 'بيانات الدخول غير صحيحة، يرجى التأكد من اسم المستخدم وكلمة المرور.',
    };
  }

  // Clean raw quotation marks around fields e.g. "password" -> كلمة المرور
  const cleaned = msg
    .replace(/"name"/g, 'الاسم')
    .replace(/"email"/g, 'البريد الإلكتروني')
    .replace(/"password"/g, 'كلمة المرور')
    .replace(/"phone"/g, 'رقم الجوال');

  return { message: cleaned };
}

export function useAppToast() {
  const show = (options: ToastOptions) => {
    const id = options.id || 'toast_' + Math.random().toString(36).substring(2, 9);
    const duration = options.duration ?? 4500;
    const type = options.type || 'info';

    let title = options.title;
    let message = options.message;

    if (type === 'error') {
      const formatted = formatErrorMessage(message);
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
    return show({ type: 'error', message, title, duration });
  };

  const success = (message: string, title?: string, duration?: number) => {
    return show({ type: 'success', message, title: title || 'تمت العملية بنجاح', duration });
  };

  const warning = (message: string, title?: string, duration?: number) => {
    return show({ type: 'warning', message, title: title || 'تنبيه مهم', duration });
  };

  const info = (message: string, title?: string, duration?: number) => {
    return show({ type: 'info', message, title: title || 'إشعار', duration });
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

