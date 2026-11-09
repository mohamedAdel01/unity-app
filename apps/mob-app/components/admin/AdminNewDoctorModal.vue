<template>
  <div v-if="isOpen" class="modal-backdrop" @click="close">
    <div class="modal-sheet" :dir="isRtl ? 'rtl' : 'ltr'" @click.stop>
      <div class="modal-header">
        <div class="header-title">
          <i class="pi pi-user-plus"></i>
          <h4>{{ t('Add New Doctor') }}</h4>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form class="doctor-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>{{ t('Doctor Name') }}</label>
          <input v-model="form.name" type="text" placeholder="د. أحمد المنصوري" required />
        </div>

        <div class="form-group">
          <label>{{ t('Phone Number') }}</label>
          <input v-model="form.phone" type="tel" :placeholder="t('+20 1X XXXX XXXX or international number')" dir="ltr" required />
        </div>

        <div class="form-group">
          <label>{{ t('Specialty') }}</label>
          <input v-model="form.specialty" type="text" :placeholder="t('Cardiology Consultant')" required />
        </div>

        <div class="two-col-row">
          <div class="form-group">
            <label>{{ t('Room') }}</label>
            <input v-model="form.room" type="text" placeholder="104" required />
          </div>
          <div class="form-group">
            <label>{{ t('Category') }}</label>
            <select v-model="form.category">
              <option value="cardio_internal">{{ t('Internal & Cardio') }}</option>
              <option value="pediatrics">{{ t('Pediatrics') }}</option>
              <option value="surgery">{{ t('Surgery') }}</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">{{ t('Cancel') }}</button>
          <button type="submit" class="btn-submit">{{ t('Register Doctor') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', doc: any): void;
}>();

const { t, isRtl } = useI18n();

const form = ref({
  name: '',
  phone: '',
  specialty: '',
  room: '105',
  category: 'cardio_internal',
});

const close = () => {
  emit('close');
};

const handleSubmit = () => {
  if (!form.value.name) return;
  const newDoc = {
    id: `doc-${Date.now()}`,
    name: form.value.name.trim(),
    phone: form.value.phone.trim(),
    specialty: form.value.specialty.trim(),
    room: form.value.room.trim(),
    category: form.value.category,
    status_badge: isRtl.value ? 'عيادة مفتوحة' : 'Open Clinic',
    schedule_time: isRtl.value ? 'اليوم: 09:00 ص - 04:00 م' : 'Today: 09:00 AM - 04:00 PM',
    cases_count: 5,
    is_active: true,
    primary_action: false,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80',
  };

  emit('created', newDoc);
  close();
};
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-sheet {
  width: 100%;
  max-width: 430px;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 20px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .modal-header .header-title,
    .form-group label {
      text-align: left;
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;

      i {
        font-size: 1.25rem;
        color: var(--unity-primary);
      }

      h4 {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }
    }

    .btn-close {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .doctor-form {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      text-align: right;

      label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      input, select {
        width: 100%;
        height: 44px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 12px;
        padding: 0 14px;
        font-size: 0.85rem;
        color: var(--unity-text-main);

        &:focus {
          outline: none;
          border-color: var(--unity-primary);
        }
      }
    }

    .two-col-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 6px;

      button {
        flex: 1;
        padding: 12px;
        border-radius: 14px;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
      }

      .btn-cancel {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);
      }

      .btn-submit {
        background: var(--unity-primary);
        color: #fff;
      }
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>

