<template>
  <div class="admin-clinics-page" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Top Supervisor Bar -->
    <div class="supervisor-top-bar">
      <div class="admin-identity">
        <div class="admin-avatar-ring">
          <i class="pi pi-building"></i>
        </div>
        <div class="admin-meta">
          <div class="name-badge-row">
            <span class="role-title">{{ isRtl ? 'إدارة العيادات والأقسام' : 'Clinics Management' }}</span>
            <span class="supervisor-badge">{{ isRtl ? 'مشرف' : 'Admin' }}</span>
          </div>
          <small class="facility-subline">{{ isRtl ? 'صحتي رعاية • بوابة الإدارة' : 'Sehaty Care • Admin Portal' }}</small>
        </div>
      </div>

      <button class="switch-patient-mode-btn" @click="router.push('/')">
        <i class="pi pi-sign-out"></i>
        <span>{{ isRtl ? 'وضع المريض' : 'Patient Mode' }}</span>
      </button>
    </div>

    <!-- Title -->
    <div class="page-title-row">
      <div class="title-wrap">
        <h3>{{ isRtl ? 'العيادات والمراكز التخصصية' : 'Specialized Clinics & Units' }}</h3>
        <p>{{ isRtl ? 'متابعة الطاقة الاستيعابية والغرف والأطباء' : 'Capacity, rooms & active staff' }}</p>
      </div>
      <button class="btn-new-clinic" @click="addNewClinic">
        <i class="pi pi-plus"></i>
        <span>{{ isRtl ? 'عيادة جديدة' : 'New Clinic' }}</span>
      </button>
    </div>

    <!-- Clinics List -->
    <div class="clinics-cards-list">
      <div v-for="clinic in clinics" :key="clinic.id" class="clinic-card">
        <div class="clinic-top">
          <div class="clinic-icon-box">
            <i :class="clinic.icon"></i>
          </div>
          <div class="clinic-info">
            <h4>{{ clinic.name }}</h4>
            <span>{{ clinic.doctors_count }} {{ isRtl ? 'أطباء معتمدين' : 'Certified Doctors' }} • {{ isRtl ? `الطابق ${clinic.floor}` : `Floor ${clinic.floor}` }}</span>
          </div>
          <span class="clinic-badge active">{{ isRtl ? 'نشطة الآن' : 'Active' }}</span>
        </div>

        <div class="clinic-footer">
          <span class="capacity-text">
            <i class="pi pi-users"></i>
            <span>{{ clinic.today_cases }} {{ isRtl ? 'حالة مجدولة اليوم' : 'Cases today' }}</span>
          </span>
          <NuxtLink to="/admin/appointments" class="view-appointments-link">
            <span>{{ isRtl ? 'سجل المواعيد' : 'Bookings' }}</span>
            <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';

definePageMeta({
  title: 'إدارة العيادات — لوحة المشرف',
});

const router = useRouter();
const { isRtl } = useI18n();
const toast = useAppToast();

const clinics = ref([
  { id: 'cl-1', name: 'عيادة أمراض الباطنة والقلب', floor: '1', doctors_count: 4, today_cases: 18, icon: 'pi pi-heart' },
  { id: 'cl-2', name: 'عيادة طب الأطفال وحديثي الولادة', floor: '2', doctors_count: 5, today_cases: 24, icon: 'pi pi-user' },
  { id: 'cl-3', name: 'عيادة الجراحة العامة والمناظير', floor: '3', doctors_count: 3, today_cases: 12, icon: 'pi pi-plus-circle' },
  { id: 'cl-4', name: 'عيادة الأسنان وجراحة الفم والفكين', floor: '1', doctors_count: 4, today_cases: 15, icon: 'pi pi-shield' },
  { id: 'cl-5', name: 'عيادة العيون والليزر', floor: '2', doctors_count: 2, today_cases: 9, icon: 'pi pi-eye' },
]);

const addNewClinic = () => {
  toast.info(isRtl.value ? 'ميزة إضافة عيادة جديدة قيد التحديث في النظام' : 'Adding clinic coming soon');
};
</script>

<style scoped lang="scss">
.admin-clinics-page {
  padding: 14px 18px 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .supervisor-top-bar .admin-identity .admin-meta,
    .page-title-row .title-wrap,
    .clinic-card .clinic-top .clinic-info {
      text-align: left;
    }
  }

  .supervisor-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .admin-identity {
      display: flex;
      align-items: center;
      gap: 10px;

      .admin-avatar-ring {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #ecfdf5;
        border: 2px solid #a7f3d0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #047857;
        font-size: 1.15rem;
      }

      .admin-meta {
        display: flex;
        flex-direction: column;
        text-align: right;

        .name-badge-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .role-title {
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }

          .supervisor-badge {
            background: #d1fae5;
            color: #065f46;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 20px;
          }
        }

        .facility-subline {
          font-size: 0.72rem;
          color: var(--unity-text-muted);
          margin-top: 1px;
        }
      }
    }

    .switch-patient-mode-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.2s;

      i {
        font-size: 0.85rem;
        color: var(--unity-text-muted);
      }

      &:hover {
        background: var(--unity-border-light);
        color: var(--unity-primary);
      }
    }
  }

  .page-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-wrap {
      display: flex;
      flex-direction: column;
      text-align: right;

      h3 {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      p {
        font-size: 0.74rem;
        color: var(--unity-text-muted);
        margin-top: 2px;
      }
    }

    .btn-new-clinic {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--unity-primary);
      color: #fff;
      border: none;
      padding: 9px 16px;
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }
  }

  .clinics-cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .clinic-card {
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

      .clinic-top {
        display: flex;
        align-items: center;
        gap: 12px;

        .clinic-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: #ecfdf5;
          color: #047857;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .clinic-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          text-align: right;

          h4 {
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }

          span {
            font-size: 0.74rem;
            color: var(--unity-text-muted);
            margin-top: 2px;
          }
        }

        .clinic-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 12px;
          background: #d1fae5;
          color: #065f46;
          white-space: nowrap;
        }
      }

      .clinic-footer {
        padding-top: 10px;
        border-top: 1px solid var(--unity-border-light);
        display: flex;
        align-items: center;
        justify-content: space-between;

        .capacity-text {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--unity-text-muted);

          i {
            color: var(--unity-primary);
          }
        }

        .view-appointments-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--unity-primary);
          text-decoration: none;
        }
      }
    }
  }
}
</style>

