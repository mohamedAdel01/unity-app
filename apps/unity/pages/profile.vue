<template>
  <div class="profile-page">
    <!-- Top Header -->
    <div class="page-top-header">
      <button class="back-btn" @click="router.back()">
        <i class="pi pi-arrow-right"></i>
      </button>
      <h3 class="page-title">الملف الشخصي والإعدادات</h3>
      <button class="settings-btn" @click="openThemeModal = !openThemeModal">
        <i class="pi pi-palette"></i>
      </button>
    </div>

    <!-- User Profile Card -->
    <div class="user-card">
      <div class="avatar-holder">
        <img 
          :src="user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'" 
          alt="Profile" 
        />
        <button class="edit-avatar-btn">
          <i class="pi pi-camera"></i>
        </button>
      </div>

      <div class="user-main-info">
        <h4>{{ user?.name || 'أحمد السلامة' }}</h4>
        <p class="user-phone">{{ user?.phone || '+966 50 123 4567' }}</p>
        <span class="mrn-badge">
          <i class="pi pi-id-card"></i>
          <span>رقم الملف: {{ user?.mrn || 'MRN-84920' }}</span>
        </span>
      </div>
    </div>

    <!-- Theme Selector Card (نظام ال themes) -->
    <div class="settings-card">
      <div class="settings-head">
        <div class="head-icon icon-emerald"><i class="pi pi-palette"></i></div>
        <div class="head-text">
          <h5>مظهر وثيم التطبيق (Theme)</h5>
          <small>اختر النمط اللوني المناسب لك</small>
        </div>
      </div>

      <div class="theme-options-grid">
        <button 
          class="theme-opt-btn opt-emerald" 
          :class="{ 'selected': theme.currentTheme.value === 'emerald' }"
          @click="theme.applyTheme('emerald')"
        >
          <span class="color-circle bg-emerald"></span>
          <span>الزمرد الطبي (أساسي)</span>
        </button>

        <button 
          class="theme-opt-btn opt-teal" 
          :class="{ 'selected': theme.currentTheme.value === 'teal' }"
          @click="theme.applyTheme('teal')"
        >
          <span class="color-circle bg-teal"></span>
          <span>التيل السريري</span>
        </button>

        <button 
          class="theme-opt-btn opt-dark" 
          :class="{ 'selected': theme.currentTheme.value === 'dark' }"
          @click="theme.applyTheme('dark')"
        >
          <span class="color-circle bg-dark"></span>
          <span>الوضع الليلي</span>
        </button>
      </div>
    </div>

    <!-- Invoices & Billing Section -->
    <div class="settings-card">
      <div class="settings-head">
        <div class="head-icon icon-blue"><i class="pi pi-wallet"></i></div>
        <div class="head-text">
          <h5>فواتيري والمدفوعات</h5>
          <small>سجل الفواتير وسندات السداد الإلكترونية</small>
        </div>
      </div>

      <div v-if="loadingInvoices" class="loading-box">
        <i class="pi pi-spin pi-spinner"></i> جاري تحميل الفواتير...
      </div>

      <div v-else-if="invoices.length === 0" class="empty-invoices">
        <p>لا توجد فواتير سابقة مسجلة</p>
      </div>

      <div v-else class="invoices-list">
        <div 
          v-for="inv in invoices" 
          :key="inv.id" 
          class="invoice-mini-card"
        >
          <div class="inv-top">
            <span class="inv-num">#{{ inv.id?.slice(0, 8) || 'INV-1092' }}</span>
            <span class="inv-status" :class="inv.status === 'paid' ? 'paid' : 'pending'">
              {{ inv.status === 'paid' ? 'مدفوعة' : 'معلقة' }}
            </span>
          </div>
          <div class="inv-bottom">
            <span class="inv-method"><i class="pi pi-credit-card"></i> {{ inv.payment_method || 'Paymob Online' }}</span>
            <strong class="inv-total">{{ inv.total || 200 }} ر.س</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Medical Records Section -->
    <div class="settings-card">
      <div class="settings-head">
        <div class="head-icon icon-green"><i class="pi pi-file"></i></div>
        <div class="head-text">
          <h5>السجل الطبي والتشخيصات</h5>
          <small>التشخيصات، الوصفات، وتقارير الزيارات</small>
        </div>
      </div>

      <div class="records-list">
        <div class="record-mini-card">
          <div class="rec-title">
            <strong>كشفية استشاري القلب والقسطرة</strong>
            <small>د. خالد السبيعي • 22 أكتوبر 2026</small>
          </div>
          <p class="rec-diag">التشخيص: فحوصات دورية سليمة ومعدل ضغط دم طبيعي 120/80.</p>
          <span class="rec-prescription"><i class="pi pi-check"></i> تم صرف فيتامين د 50,000 وحدة</span>
        </div>
      </div>
    </div>

    <!-- Auth Management (Login / Register / Logout) -->
    <div class="auth-section">
      <button v-if="api.token.value" class="logout-btn" @click="handleLogout">
        <i class="pi pi-sign-out"></i>
        <span>تسجيل الخروج من الحساب</span>
      </button>

      <div v-else class="login-prompt-card">
        <h5>تسجيل الدخول للاطلاع على ملفك الطبي</h5>
        <p>سجل دخولك أو أنشئ حساب مريض جديد لحفظ مواعيدك وسجلاتك الطبية</p>
        <button class="login-action-btn" @click="openAuthModal = true">
          تسجيل الدخول / إنشاء حساب
        </button>
      </div>
    </div>

    <!-- Auth Modal -->
    <Teleport to="body">
      <div v-if="openAuthModal" class="auth-modal-backdrop" @click="openAuthModal = false">
        <div class="auth-modal-sheet" @click.stop>
          <div class="modal-pill"></div>
          <h4>{{ isRegister ? 'إنشاء حساب مريض جديد' : 'تسجيل الدخول' }}</h4>

          <div class="auth-form">
            <div v-if="isRegister" class="form-group">
              <label>الاسم الكامل</label>
              <input v-model="authForm.name" type="text" placeholder="مثال: أحمد السلامة" />
            </div>

            <div class="form-group">
              <label>البريد الإلكتروني</label>
              <input v-model="authForm.email" type="email" placeholder="example@email.com" />
            </div>

            <div class="form-group">
              <label>كلمة المرور</label>
              <input v-model="authForm.password" type="password" placeholder="••••••••" />
            </div>

            <div v-if="isRegister" class="form-group">
              <label>رقم الجوال</label>
              <input v-model="authForm.phone" type="tel" placeholder="05XXXXXXXX" />
            </div>

            <button class="submit-auth-btn" :disabled="authLoading" @click="submitAuth">
              <i v-if="authLoading" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ isRegister ? 'إنشاء الحساب' : 'دخول' }}</span>
            </button>

            <button class="toggle-auth-btn" @click="isRegister = !isRegister">
              {{ isRegister ? 'لديك حساب بالفعل؟ سجل دخولك' : 'مستخدم جديد؟ أنشئ حسابك الآن' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUnityApi } from '../composables/useUnityApi';
import { useTheme } from '../composables/useTheme';

const router = useRouter();
const api = useUnityApi();
const theme = useTheme();

const user = ref<any>(api.currentUser.value || {
  name: 'أحمد السلامة',
  phone: '+966 50 123 4567',
  mrn: 'MRN-84920',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
});

const invoices = ref<any[]>([]);
const loadingInvoices = ref(false);
const openThemeModal = ref(false);

const openAuthModal = ref(false);
const isRegister = ref(false);
const authLoading = ref(false);
const authForm = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
});

const loadInvoices = async () => {
  try {
    loadingInvoices.value = true;
    const res = await api.getInvoices();
    if (res.status && Array.isArray(res.data) && res.data.length > 0) {
      invoices.value = res.data;
    } else {
      invoices.value = [
        { id: 'inv-1092', status: 'paid', total: 200, payment_method: 'Paymob Apple Pay' },
        { id: 'inv-1088', status: 'paid', total: 350, payment_method: 'Mada / Visa' },
      ];
    }
  } catch (e) {
    // Keep fallback list
  } finally {
    loadingInvoices.value = false;
  }
};

const submitAuth = async () => {
  try {
    authLoading.value = true;
    if (isRegister.value) {
      await api.registerPatient({
        name: authForm.value.name,
        email: authForm.value.email,
        password: authForm.value.password,
        phone: authForm.value.phone,
      });
    } else {
      await api.login(authForm.value.email, authForm.value.password);
    }
    user.value = api.currentUser.value;
    openAuthModal.value = false;
  } catch (err: any) {
    alert(err.message || 'حدث خطأ في عملية تسجيل الدخول');
  } finally {
    authLoading.value = false;
  }
};

const handleLogout = () => {
  api.logout();
  user.value = null;
  router.push('/');
};

onMounted(() => {
  loadInvoices();
});
</script>

<style scoped lang="scss">
.profile-page {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .back-btn, .settings-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-main);
    cursor: pointer;
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--unity-text-main);
  }
}

// User Profile Card
.user-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 22px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .avatar-holder {
    position: relative;
    width: 68px;
    height: 68px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .edit-avatar-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--unity-primary-dark);
      color: #fff;
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      cursor: pointer;
    }
  }

  .user-main-info {
    flex: 1;

    h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    .user-phone {
      font-size: 0.8rem;
      color: var(--unity-text-muted);
      direction: ltr;
      text-align: right;
      margin: 2px 0 6px;
    }

    .mrn-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #ecfdf5;
      color: #047857;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 0.72rem;
      font-weight: 700;
    }
  }
}

// Settings Card
.settings-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .settings-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;

    .head-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;

      &.icon-emerald { background: #ecfdf5; color: #047857; }
      &.icon-blue { background: #e0f2fe; color: #0369a1; }
      &.icon-green { background: #dcfce7; color: #15803d; }
    }

    .head-text {
      h5 {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }
      small {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }
    }
  }
}

// Theme Options Grid
.theme-options-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .theme-opt-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 14px;
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    color: var(--unity-text-main);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    .color-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;

      &.bg-emerald { background: #047857; }
      &.bg-teal { background: #0f766e; }
      &.bg-dark { background: #111827; border: 1px solid #4b5563; }
    }

    &.selected {
      border-color: var(--unity-primary);
      background: var(--unity-primary-light);
      color: var(--unity-primary-dark);
    }
  }
}

// Invoices List
.invoices-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .invoice-mini-card {
    background: var(--unity-bg);
    border-radius: 12px;
    padding: 10px 12px;

    .inv-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;

      .inv-num {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .inv-status {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 6px;

        &.paid { background: #dcfce7; color: #15803d; }
        &.pending { background: #fef3c7; color: #b45309; }
      }
    }

    .inv-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .inv-method {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }

      .inv-total {
        font-size: 0.85rem;
        color: var(--unity-primary);
        font-weight: 800;
      }
    }
  }
}

// Records List
.records-list {
  .record-mini-card {
    background: var(--unity-bg);
    border-radius: 12px;
    padding: 12px;

    .rec-title {
      display: flex;
      flex-direction: column;
      margin-bottom: 4px;

      strong {
        font-size: 0.88rem;
        color: var(--unity-text-main);
      }
      small {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }
    }

    .rec-diag {
      font-size: 0.78rem;
      color: var(--unity-text-main);
      margin-bottom: 6px;
    }

    .rec-prescription {
      font-size: 0.72rem;
      color: #047857;
      font-weight: 700;
    }
  }
}

.auth-section {
  padding-bottom: 20px;

  .logout-btn {
    width: 100%;
    padding: 12px;
    border-radius: 14px;
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fee2e2;
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:hover {
      background: #fee2e2;
    }
  }

  .login-prompt-card {
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    border-radius: 20px;
    padding: 18px;
    text-align: center;

    h5 {
      font-size: 0.98rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin-bottom: 4px;
    }

    p {
      font-size: 0.78rem;
      color: var(--unity-text-muted);
      margin-bottom: 14px;
    }

    .login-action-btn {
      width: 100%;
      padding: 12px;
      border-radius: 14px;
      background: var(--unity-primary-dark);
      color: #fff;
      border: none;
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
    }
  }
}

// Auth Modal
.auth-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.auth-modal-sheet {
  width: 100%;
  max-width: 440px;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 16px 20px 32px;
  direction: rtl;

  .modal-pill {
    width: 44px;
    height: 5px;
    border-radius: 10px;
    background: var(--unity-border);
    margin: 0 auto 16px;
  }

  h4 {
    font-size: 1.15rem;
    font-weight: 800;
    margin-bottom: 16px;
    color: var(--unity-text-main);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--unity-text-muted);
      }

      input {
        padding: 10px 14px;
        border-radius: 12px;
        border: 1.5px solid var(--unity-border);
        background: var(--unity-bg);
        font-size: 0.85rem;
        color: var(--unity-text-main);
        outline: none;

        &:focus {
          border-color: var(--unity-primary);
        }
      }
    }

    .submit-auth-btn {
      width: 100%;
      padding: 12px;
      border-radius: 14px;
      background: var(--unity-primary-dark);
      color: #fff;
      border: none;
      font-size: 0.9rem;
      font-weight: 800;
      cursor: pointer;
      margin-top: 6px;
    }

    .toggle-auth-btn {
      background: none;
      border: none;
      color: var(--unity-primary);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
    }
  }
}
</style>

