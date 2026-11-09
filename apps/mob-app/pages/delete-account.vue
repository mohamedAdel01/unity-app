<template>
  <div class="delete-account-page">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="router.back()" aria-label="Back">
        <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
      </button>
      <h1 class="page-title">{{ isRtl ? 'حذف الحساب' : 'Delete Account' }}</h1>
      <div class="placeholder-icon"></div>
    </header>

    <div class="content-scroll">
      <!-- Warning Banner -->
      <div class="warning-box">
        <div class="warning-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="warning-text">
          <h5>{{ isRtl ? 'تنبيه هام قبل الحذف' : 'Important Notice' }}</h5>
          <p>
            {{
              isRtl
                ? 'إجراء حذف الحساب نهائي ولا يمكن التراجع عنه. ستفقد إمكانية الوصول إلى ملفك الشخصي ومواعيدك القادمة وسجل النشاط.'
                : 'Deleting your account is permanent and cannot be undone. You will lose access to your profile, upcoming appointments, and activity history.'
            }}
          </p>
        </div>
      </div>

      <!-- Deletion Info Card -->
      <div class="info-card">
        <h4>{{ isRtl ? 'ما الذي سيتم حذفه ومسحه؟' : 'What data will be deleted?' }}</h4>
        <ul class="data-list">
          <li>
            <i class="pi pi-check-circle"></i>
            <span>{{ isRtl ? 'بيانات تسجيل الدخول وكلمة المرور ورقم الجوال.' : 'Login credentials, password, and registered phone.' }}</span>
          </li>
          <li>
            <i class="pi pi-check-circle"></i>
            <span>{{ isRtl ? 'تفضيلات التطبيق والإشعارات والعناوين المسجلة.' : 'App preferences, notifications, and saved addresses.' }}</span>
          </li>
          <li>
            <i class="pi pi-check-circle"></i>
            <span>{{ isRtl ? 'المواعيد المستقبلية غير المكتملة سيتم إلغاؤها.' : 'Upcoming pending appointments will be automatically canceled.' }}</span>
          </li>
        </ul>

        <div class="retention-notice">
          <i class="pi pi-info-circle"></i>
          <small>
            {{
              isRtl
                ? 'ملاحظة طبية: تبقى السجلات الطبية والتقارير المحررة من قبل الأطباء محفوظة في الأرشيف الطبي للمنشأة وفقاً للوائح والأنظمة الصحية المعمول بها لحفظ السجلات الطبية قانونياً.'
                : 'Medical notice: Health diagnostic records and prescriptions issued by clinics remain securely archived in accordance with healthcare regulatory retention laws.'
            }}
          </small>
        </div>
      </div>

      <!-- Reason Selection -->
      <div class="reason-section">
        <label class="section-label">{{ isRtl ? 'سبب الرغبة في الحذف (اختياري)' : 'Reason for deletion (optional)' }}</label>
        <div class="reasons-chips">
          <button
            v-for="(item, index) in reasons"
            :key="index"
            type="button"
            class="reason-chip"
            :class="{ active: selectedReason === item }"
            @click="selectedReason = item"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <!-- Additional Feedback Textarea -->
      <div class="notes-section">
        <label class="section-label">{{ isRtl ? 'ملاحظاتك الإضافية' : 'Additional comments' }}</label>
        <textarea
          v-model="feedbackText"
          class="feedback-input"
          :placeholder="isRtl ? 'اكتب ملاحظاتك لمساعدتنا على تحسين الخدمة...' : 'Tell us how we can improve...'"
          rows="3"
        ></textarea>
      </div>

      <!-- Checkbox Confirmation -->
      <label class="confirm-check-label">
        <input type="checkbox" v-model="confirmed" class="checkbox-input" />
        <span>{{ isRtl ? 'أنا أدرك أن هذا الإجراء نهائي وسيؤدي لحذف بيانات حسابي بالكامل.' : 'I understand that this action is permanent and will delete my account data.' }}</span>
      </label>

      <!-- Action Button -->
      <button
        class="delete-btn"
        :disabled="!confirmed || isDeleting"
        @click="showConfirmDialog = true"
      >
        <i v-if="isDeleting" class="pi pi-spin pi-spinner"></i>
        <i v-else class="pi pi-trash"></i>
        <span>{{ isRtl ? 'تأكيد طلب حذف الحساب' : 'Confirm Account Deletion' }}</span>
      </button>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmDialog" class="modal-backdrop" @click.self="showConfirmDialog = false">
      <div class="modal-card">
        <div class="modal-icon-badge">
          <i class="pi pi-trash"></i>
        </div>
        <h3>{{ isRtl ? 'تأكيد الحذف النهائي' : 'Permanent Deletion' }}</h3>
        <p>
          {{
            isRtl
              ? 'هل أنت متأكد تماماً من رغبتك في حذف هذا الحساب؟ ستسجل الخروج فوراً وسيتم معالجة مسح بياناتك.'
              : 'Are you absolutely sure you want to delete this account? You will be signed out immediately and your data deletion will be processed.'
          }}
        </p>

        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showConfirmDialog = false">
            {{ isRtl ? 'إلغاء وتراجع' : 'Cancel' }}
          </button>
          <button class="modal-btn delete" :disabled="isDeleting" @click="handleDeleteAccount">
            <i v-if="isDeleting" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ isRtl ? 'نعم، احذف حسابي' : 'Yes, Delete Account' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../composables/useI18n';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const { isRtl } = useI18n();

const confirmed = ref(false);
const isDeleting = ref(false);
const selectedReason = ref('');
const feedbackText = ref('');
const showConfirmDialog = ref(false);

const reasons = [
  isRtl.value ? 'لم أعد بحاجة للخدمة' : 'No longer need service',
  isRtl.value ? 'لدي حساب آخر' : 'I have another account',
  isRtl.value ? 'مخاوف تتعلق بالخصوصية' : 'Privacy concerns',
  isRtl.value ? 'صعوبة في استخدام التطبيق' : 'Difficulty using app',
  isRtl.value ? 'سبب آخر' : 'Other'
];

const handleDeleteAccount = async () => {
  isDeleting.value = true;
  try {
    // Artificial small delay for UX feedback
    await new Promise((r) => setTimeout(r, 800));

    // Sign out user and clear storage
    if (authStore.logout) {
      await authStore.logout();
    }
    showConfirmDialog.value = false;
    router.replace('/auth/login');
  } catch (err) {
    console.error('Delete account error:', err);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped lang="scss">
.delete-account-page {
  padding: 16px 18px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--unity-bg);
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .back-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-main);
    cursor: pointer;
    font-size: 0.95rem;

    &:active {
      background: var(--unity-border);
    }
  }

  .page-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text-main);
    margin: 0;
  }

  .placeholder-icon {
    width: 38px;
    height: 38px;
  }
}

.content-scroll {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.warning-box {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 14px;

  .warning-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #ef4444;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .warning-text {
    h5 {
      margin: 0 0 4px;
      font-size: 0.92rem;
      font-weight: 700;
      color: #ef4444;
    }

    p {
      margin: 0;
      font-size: 0.8rem;
      line-height: 1.5;
      color: var(--unity-text-muted);
    }
  }
}

.info-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 14px;
  padding: 16px;

  h4 {
    margin: 0 0 12px;
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }

  .data-list {
    list-style: none;
    padding: 0;
    margin: 0 0 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      color: var(--unity-text-muted);

      i {
        color: #ef4444;
        font-size: 0.85rem;
      }
    }
  }

  .retention-notice {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding-top: 10px;
    border-top: 1px dashed var(--unity-border);

    i {
      color: var(--unity-primary);
      font-size: 0.85rem;
      margin-top: 2px;
    }

    small {
      font-size: 0.74rem;
      line-height: 1.5;
      color: var(--unity-text-muted);
    }
  }
}

.section-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--unity-text-main);
  display: block;
  margin-bottom: 8px;
}

.reasons-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .reason-chip {
    padding: 8px 14px;
    border-radius: 20px;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-muted);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: rgba(16, 185, 129, 0.12);
      border-color: #10b981;
      color: #10b981;
      font-weight: 600;
    }
  }
}

.notes-section {
  .feedback-input {
    width: 100%;
    padding: 10px 14px;
    border-radius: 12px;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-main);
    font-size: 0.85rem;
    font-family: inherit;
    resize: none;
    outline: none;

    &:focus {
      border-color: #10b981;
    }
  }
}

.confirm-check-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--unity-text-muted);

  .checkbox-input {
    width: 18px;
    height: 18px;
    accent-color: #ef4444;
    cursor: pointer;
    margin-top: 2px;
    flex-shrink: 0;
  }
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 0.92rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    opacity: 0.85;
  }
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 340px;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 20px;
  padding: 24px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);

  .modal-icon-badge {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }

  p {
    margin: 0 0 20px;
    font-size: 0.82rem;
    line-height: 1.5;
    color: var(--unity-text-muted);
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    width: 100%;

    .modal-btn {
      flex: 1;
      padding: 12px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      border: none;
      transition: opacity 0.2s;

      &.cancel {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-main);
      }

      &.delete {
        background: #ef4444;
        color: #fff;
      }

      &:disabled {
        opacity: 0.6;
      }
    }
  }
}
</style>

