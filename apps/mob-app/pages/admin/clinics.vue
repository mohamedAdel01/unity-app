<template>
  <div class="admin-clinics-page">
    <!-- 1. Top Supervisor Bar (Unified) -->
    <AdminTopHeader 
      :title="activeTab === 'clinics' ? t('Clinics Management') : t('Services Management')"
      :subtitle="t('Unity Clinics • Admin Portal')"
      :icon="activeTab === 'clinics' ? 'pi pi-building' : 'pi pi-shield'"
    />

    <!-- 2. Dual Mode Selector Tabs (Clinics vs Services) -->
    <div class="clinics-mode-tabs">
      <button 
        type="button" 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'clinics' }"
        @click="activeTab = 'clinics'"
      >
        <i class="pi pi-building"></i>
        <span>{{ t('Specialized Clinics') }}</span>
        <span class="count-pill">{{ clinics.length }}</span>
      </button>

      <button 
        type="button" 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'services' }"
        @click="activeTab = 'services'"
      >
        <i class="pi pi-shield"></i>
        <span>{{ t('Medical Services') }}</span>
        <span class="count-pill">{{ services.length }}</span>
      </button>
    </div>

    <!-- 3. Page Title & Action Row -->
    <div class="page-title-row">
      <!-- Title & Subtitle for Clinics -->
      <div v-if="activeTab === 'clinics'" class="title-wrap">
        <h3>{{ t('Specialized Clinics & Units') }}</h3>
        <p>{{ t('Capacity, rooms & active staff') }}</p>
      </div>
      <!-- Title & Subtitle for Services -->
      <div v-else class="title-wrap">
        <h3>{{ t('Medical Services & Procedures') }}</h3>
        <p>{{ t('Pricing, durations & availability') }}</p>
      </div>

      <!-- Action Button (New Clinic or New Service) -->
      <button 
        v-if="activeTab === 'clinics'" 
        class="btn-new-item" 
        @click="isNewClinicModalOpen = true"
      >
        <i class="pi pi-plus"></i>
        <span>{{ t('New Clinic') }}</span>
      </button>
      <button 
        v-else 
        class="btn-new-item" 
        @click="isNewServiceModalOpen = true"
      >
        <i class="pi pi-plus"></i>
        <span>{{ t('New Service') }}</span>
      </button>
    </div>

    <!-- 4. Tab 1: Clinics Cards List -->
    <div v-if="activeTab === 'clinics'">
      <div v-if="clinics.length > 0" class="cards-list">
        <div v-for="clinic in clinics" :key="clinic.id" class="entity-card">
          <div class="card-top">
            <div class="icon-box clinic">
              <i class="pi pi-building"></i>
            </div>
            <div class="entity-info">
              <h4>{{ clinic.name }}</h4>
              <span>{{ clinic.doctors_count }} {{ t('Certified Doctors') }} • {{ t('Active Clinic') }}</span>
            </div>
            <button 
              class="status-toggle-badge" 
              :class="clinic.is_active ? 'active' : 'inactive'"
              @click="toggleClinicStatus(clinic)"
            >
              {{ clinic.is_active ? t('Active') : t('Inactive') }}
            </button>
          </div>

          <div class="card-footer">
            <span class="capacity-text">
              <i class="pi pi-users"></i>
              <span>{{ clinic.doctors_count }} {{ t('Doctors') }}</span>
            </span>
            <NuxtLink to="/admin/appointments" class="card-action-link">
              <span>{{ t('Bookings') }}</span>
              <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Empty State for Clinics -->
      <div v-else class="empty-state">
        <i class="pi pi-building"></i>
        <h5>{{ t('No clinics registered yet') }}</h5>
        <p>{{ t('Add specialized clinics to start assigning doctors and services.') }}</p>
      </div>
    </div>

    <!-- 5. Tab 2: Medical Services Cards List -->
    <div v-else-if="activeTab === 'services'">
      <div v-if="services.length > 0" class="cards-list">
        <div v-for="srv in services" :key="srv.id" class="entity-card service-entity">
          <div class="card-top">
            <div class="icon-box service">
              <i class="pi pi-shield"></i>
            </div>
            <div class="entity-info">
              <h4>{{ srv.name }}</h4>
              <p v-if="srv.description" class="srv-desc">{{ srv.description }}</p>
              <div class="srv-meta-row">
                <span class="srv-price">{{ srv.price }} {{ t('EGP') }}</span>
                <span class="srv-dot">•</span>
                <span class="srv-duration"><i class="pi pi-clock"></i> {{ srv.duration || 15 }} {{ t('mins') }}</span>
              </div>
            </div>
            <button 
              class="status-toggle-badge" 
              :class="srv.is_active ? 'active' : 'inactive'"
              @click="toggleServiceStatus(srv)"
            >
              {{ srv.is_active ? t('Active') : t('Inactive') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State for Services -->
      <div v-else class="empty-state">
        <i class="pi pi-shield"></i>
        <h5>{{ t('No medical services registered yet') }}</h5>
        <p>{{ t('Add hospital services to enable appointments and patient bookings.') }}</p>
      </div>
    </div>

    <!-- Modal 1: Add New Clinic -->
    <div v-if="isNewClinicModalOpen" class="modal-backdrop" @click="isNewClinicModalOpen = false">
      <div class="modal-sheet" @click.stop>
        <div class="modal-head">
          <h4>{{ t('New Clinic') }}</h4>
          <button class="btn-close" :aria-label="t('Close')" @click="isNewClinicModalOpen = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <label class="field-label">{{ t('Clinic Name') }}</label>
          <input 
            v-model="newClinicName" 
            type="text" 
            class="input-field" 
            :placeholder="t('e.g. Cardiology Clinic')"
            autofocus
            @keyup.enter="createClinic"
          />
        </div>
        <div class="modal-foot">
          <button class="btn-cancel" @click="isNewClinicModalOpen = false">{{ t('Cancel') }}</button>
          <button class="btn-confirm" :disabled="!newClinicName.trim() || creatingClinic" @click="createClinic">
            <i v-if="creatingClinic" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ t('Save') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal 2: Add New Service -->
    <div v-if="isNewServiceModalOpen" class="modal-backdrop" @click="isNewServiceModalOpen = false">
      <div class="modal-sheet" @click.stop>
        <div class="modal-head">
          <h4>{{ t('Add New Service') }}</h4>
          <button class="btn-close" :aria-label="t('Close')" @click="isNewServiceModalOpen = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form class="modal-body" @submit.prevent="createService">
          <div class="form-group">
            <label class="field-label">{{ t('Service Name') }}</label>
            <input 
              v-model="serviceForm.name" 
              type="text" 
              class="input-field" 
              :placeholder="t('e.g. Complete Blood Count (CBC)')"
              required 
              autofocus
            />
          </div>

          <div class="two-col-grid">
            <div class="form-group">
              <label class="field-label">{{ t('Price') }} ({{ t('EGP') }})</label>
              <input 
                v-model.number="serviceForm.price" 
                type="number" 
                min="0" 
                step="1" 
                class="input-field" 
                placeholder="250"
                required
              />
            </div>
            <div class="form-group">
              <label class="field-label">{{ t('Duration') }}</label>
              <input 
                v-model.number="serviceForm.duration" 
                type="number" 
                min="5" 
                max="180" 
                step="5" 
                class="input-field" 
                placeholder="15"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">{{ t('Description (Optional)') }}</label>
            <textarea 
              v-model="serviceForm.description" 
              rows="2" 
              class="input-field textarea" 
              :placeholder="t('e.g. Diagnostic scan including detailed medical report')"
            ></textarea>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="isNewServiceModalOpen = false">
              {{ t('Cancel') }}
            </button>
            <button type="submit" class="btn-confirm" :disabled="!isServiceFormValid || creatingService">
              <i v-if="creatingService" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ t('Save') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminTopHeader from '../../components/admin/AdminTopHeader.vue';

definePageMeta({
  title: 'إدارة العيادات والخدمات — لوحة المشرف',
});

const router = useRouter();
const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const activeTab = ref<'clinics' | 'services'>('clinics');

const clinics = ref<any[]>([]);
const services = ref<any[]>([]);

const isNewClinicModalOpen = ref(false);
const newClinicName = ref('');
const creatingClinic = ref(false);

const isNewServiceModalOpen = ref(false);
const creatingService = ref(false);
const serviceForm = ref({
  name: '',
  price: 200,
  duration: 15,
  description: '',
});

// 3. Computed (computed properties)
const isServiceFormValid = computed(() => {
  return serviceForm.value.name.trim().length >= 2 && serviceForm.value.price > 0;
});

// 4. Methods (functions, handlers)
const loadBackendClinics = async () => {
  try {
    const res = await api.apiRequest({ service: 'ADMIN_CLINICS' });
    if (res?.status && Array.isArray(res?.data)) {
      clinics.value = res.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        doctors_count: c._count?.doctors || c.doctors?.length || 0,
        is_active: c.is_active ?? true,
      }));
    }
  } catch (err) {
    clinics.value = [];
  }
};

const loadBackendServices = async () => {
  try {
    const res = await api.apiRequest({ service: 'ADMIN_SERVICES' });
    if (res?.status && Array.isArray(res?.data)) {
      services.value = res.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration || 15,
        description: s.description || '',
        is_active: s.is_active ?? true,
      }));
    }
  } catch (err) {
    services.value = [];
  }
};

const toggleClinicStatus = async (clinic: any) => {
  try {
    await api.apiRequest({
      service: 'ADMIN_TOGGLE_CLINIC',
      payload: { id: clinic.id },
    });
    clinic.is_active = !clinic.is_active;
    toast.success(t('Clinic status updated successfully'));
  } catch (err: any) {
    toast.error(err.message || t('Failed to update clinic'));
  }
};

const toggleServiceStatus = async (srv: any) => {
  try {
    await api.apiRequest({
      service: 'ADMIN_TOGGLE_SERVICE',
      payload: { id: srv.id },
    });
    srv.is_active = !srv.is_active;
    toast.success(t('Service status updated successfully'));
  } catch (err: any) {
    toast.error(err.message || t('Failed to update service'));
  }
};

const createClinic = async () => {
  if (!newClinicName.value.trim()) return;
  creatingClinic.value = true;
  try {
    const res = await api.apiRequest({
      service: 'ADMIN_CREATE_CLINIC',
      payload: { name: newClinicName.value.trim(), is_active: true },
    });
    if (res?.status && res?.data) {
      clinics.value.push({
        id: res.data.id,
        name: res.data.name,
        doctors_count: 0,
        is_active: true,
      });
      newClinicName.value = '';
      isNewClinicModalOpen.value = false;
      toast.success(t('New clinic added successfully!'));
    }
  } catch (err: any) {
    toast.error(err.message || t('Failed to create clinic'));
  } finally {
    creatingClinic.value = false;
  }
};

const createService = async () => {
  if (!isServiceFormValid.value) return;
  creatingService.value = true;
  try {
    const res = await api.apiRequest({
      service: 'ADMIN_CREATE_SERVICE',
      payload: {
        name: serviceForm.value.name.trim(),
        price: Number(serviceForm.value.price),
        duration: Number(serviceForm.value.duration),
        description: serviceForm.value.description?.trim() || null,
        is_active: true,
      },
    });

    if (res?.status && res?.data) {
      services.value.unshift({
        id: res.data.id,
        name: res.data.name,
        price: res.data.price,
        duration: res.data.duration,
        description: res.data.description,
        is_active: true,
      });
      serviceForm.value = {
        name: '',
        price: 200,
        duration: 15,
        description: '',
      };
      isNewServiceModalOpen.value = false;
      toast.success(t('New service added successfully!'));
    }
  } catch (err: any) {
    toast.error(err.message || t('Failed to create service'));
  } finally {
    creatingService.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  loadBackendClinics();
  loadBackendServices();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-clinics-page {
  padding: 14px 18px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .page-title-row,
    .entity-info,
    .modal-body {
      text-align: left;
    }
  }

  // 1. Dual Mode Tabs
  .clinics-mode-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    padding: 6px;
    border-radius: 18px;

    .tab-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: var(--unity-text-muted);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      i {
        font-size: 0.95rem;
      }

      .count-pill {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);
        font-size: 0.68rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 12px;
      }

      &.active {
        background: var(--unity-primary);
        color: #fff;
        box-shadow: 0 4px 12px rgba(4, 120, 87, 0.2);

        .count-pill {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.3);
          color: #fff;
        }
      }
    }
  }

  // 2. Title & Action Row
  .page-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: right;

    .title-wrap {
      h3 {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
      }

      p {
        font-size: 0.75rem;
        color: var(--unity-text-muted);
        margin: 2px 0 0;
      }
    }

    .btn-new-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--unity-primary);
      color: #fff;
      border: none;
      padding: 9px 16px;
      border-radius: 14px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
      transition: all 0.2s;

      &:hover {
        background: var(--unity-primary-dark);
      }
    }
  }

  // 3. Cards List
  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .entity-card {
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    transition: transform 0.2s;

    .card-top {
      display: flex;
      align-items: center;
      gap: 12px;

      .icon-box {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        flex-shrink: 0;

        &.clinic {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        &.service {
          background: #e0f2fe;
          color: #0284c7;
          border: 1px solid #bae6fd;
        }
      }

      .entity-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        text-align: right;

        h4 {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--unity-text-main);
          margin: 0;
        }

        span {
          font-size: 0.72rem;
          color: var(--unity-text-muted);
        }

        .srv-desc {
          font-size: 0.74rem;
          color: var(--unity-text-muted);
          margin: 0;
          line-height: 1.3;
        }

        .srv-meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;

          .srv-price {
            font-size: 0.85rem;
            font-weight: 800;
            color: #047857;
          }

          .srv-dot {
            color: var(--unity-text-dim);
          }

          .srv-duration {
            font-size: 0.72rem;
            color: var(--unity-text-muted);
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
        }
      }

      .status-toggle-badge {
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.72rem;
        font-weight: 700;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        flex-shrink: 0;

        &.active {
          background: #d1fae5;
          color: #065f46;
        }

        &.inactive {
          background: #fee2e2;
          color: #b91c1c;
        }
      }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--unity-border);
      padding-top: 12px;

      .capacity-text {
        font-size: 0.75rem;
        color: var(--unity-text-muted);
        display: inline-flex;
        align-items: center;
        gap: 6px;

        i {
          color: var(--unity-primary);
        }
      }

      .card-action-link {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-primary);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: gap 0.2s;

        &:hover {
          gap: 8px;
        }
      }
    }
  }

  // 4. Empty State
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
    background: var(--unity-surface);
    border: 1px dashed var(--unity-border);
    border-radius: 20px;
    color: var(--unity-text-muted);

    i {
      font-size: 2.2rem;
      color: var(--unity-text-dim);
      margin-bottom: 12px;
    }

    h5 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--unity-text-main);
      margin: 0 0 6px;
    }

    p {
      font-size: 0.78rem;
      max-width: 280px;
      margin: 0;
      line-height: 1.4;
    }
  }

  // 5. Modals Styling
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

    .modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h4 {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
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
        transition: all 0.2s;

        &:hover {
          background: var(--unity-border);
          color: var(--unity-text-main);
        }
      }
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: right;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .two-col-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .field-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .input-field {
        width: 100%;
        height: 46px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 12px;
        padding: 0 14px;
        font-size: 0.85rem;
        color: var(--unity-text-main);
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;

        &:focus {
          border-color: var(--unity-primary);
        }

        &.textarea {
          height: auto;
          padding: 10px 14px;
          resize: none;
        }
      }
    }

    .modal-foot {
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
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
      }

      .btn-cancel {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);

        &:hover {
          background: var(--unity-border);
          color: var(--unity-text-main);
        }
      }

      .btn-confirm {
        background: var(--unity-primary);
        color: #fff;
        box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

        &:hover:not(:disabled) {
          background: var(--unity-primary-dark);
        }

        &:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
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
