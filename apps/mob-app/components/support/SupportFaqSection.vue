<template>
  <section class="support-faq-section">
    <div class="faq-section-header">
      <div class="faq-title-box">
        <h3 class="section-title">{{ t('Frequently Asked Questions') }}</h3>
        <p class="section-subtitle">{{ t('Quick answers to commonly asked questions') }}</p>
      </div>

      <!-- Search Input -->
      <div class="faq-search-box">
        <i class="pi pi-search search-icon"></i>
        <input 
          v-model="searchQuery"
          type="search" 
          :placeholder="t('Search for a question or issue...')" 
          class="faq-search-input"
          autocomplete="off"
        />
        <button 
          v-if="searchQuery" 
          type="button" 
          class="clear-search-btn" 
          @click="searchQuery = ''"
          :aria-label="t('Cancel')"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Categories Pills -->
      <div class="faq-category-pills" role="tablist">
        <button 
          v-for="cat in categories" 
          :key="cat.key" 
          type="button" 
          :class="['category-pill', { active: selectedCategory === cat.key }]"
          @click="selectedCategory = cat.key"
        >
          <i :class="cat.icon"></i>
          <span>{{ t(cat.label) }}</span>
        </button>
      </div>
    </div>

    <!-- FAQ Accordion List -->
    <div class="faq-list">
      <div 
        v-for="item in filteredFaqs" 
        :key="item.id" 
        class="faq-item"
        :class="{ expanded: expandedId === item.id }"
      >
        <button 
          type="button" 
          class="faq-question-btn" 
          @click="toggleItem(item.id)"
          :aria-expanded="expandedId === item.id"
        >
          <div class="question-prefix-icon">
            <i class="pi pi-question-circle"></i>
          </div>
          <span class="question-text">{{ t(item.question) }}</span>
          <i :class="['pi', expandedId === item.id ? 'pi-chevron-up' : 'pi-chevron-down', 'toggle-icon']"></i>
        </button>

        <transition name="accordion">
          <div v-if="expandedId === item.id" class="faq-answer-container">
            <div class="answer-content">
              <p class="answer-text">{{ t(item.answer) }}</p>
              
              <!-- Helpful feedback prompt -->
              <div class="feedback-prompt">
                <span class="prompt-text">{{ t('Was this answer helpful?') }}</span>
                <div class="feedback-actions">
                  <button 
                    type="button" 
                    :class="['feedback-btn', { selected: feedbackState[item.id] === 'yes' }]"
                    @click="onRateFeedback(item.id, 'yes')"
                  >
                    <i class="pi pi-thumbs-up"></i>
                    <span>{{ t('Yes') }}</span>
                  </button>
                  <button 
                    type="button" 
                    :class="['feedback-btn', { selected: feedbackState[item.id] === 'no' }]"
                    @click="onRateFeedback(item.id, 'no')"
                  >
                    <i class="pi pi-thumbs-down"></i>
                    <span>{{ t('No') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Empty State -->
      <div v-if="filteredFaqs.length === 0" class="faq-empty-state">
        <div class="empty-icon-shell">
          <i class="pi pi-search-minus"></i>
        </div>
        <h6 class="empty-title">{{ t('No matching questions found') }}</h6>
        <p class="empty-desc">{{ t('Try searching with different terms or contact our live support team.') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';

const { t } = useI18n();
const { show: showToast } = useAppToast();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
const selectedCategory = ref('all');
const expandedId = ref<string | null>('faq_1');
const feedbackState = ref<Record<string, 'yes' | 'no'>>({});

const categories = [
  { key: 'all', label: 'All Questions', icon: 'pi pi-list' },
  { key: 'appointments', label: 'Bookings & Appointments', icon: 'pi pi-calendar' },
  { key: 'records', label: 'Medical Records & Reports', icon: 'pi pi-folder' },
  { key: 'account', label: 'Account & Privacy', icon: 'pi pi-user' },
  { key: 'technical', label: 'App & Technical', icon: 'pi pi-cog' },
];

const faqs = [
  {
    id: 'faq_1',
    category: 'appointments',
    question: 'How do I book or cancel a doctor appointment?',
    answer: 'You can easily book by choosing "Doctor Consultation" from the home screen, selecting your doctor, and picking an available time slot. To cancel or reschedule, go to the "Appointments" tab and tap "Cancel Appointment" at least 2 hours before the scheduled time.',
  },
  {
    id: 'faq_2',
    category: 'records',
    question: 'When will my lab results and medical reports appear?',
    answer: 'Once your clinic visits or medical tests are processed by the hospital laboratory, results are automatically uploaded and linked to your profile in the "Medical Records" tab within 12 to 24 hours.',
  },
  {
    id: 'faq_3',
    category: 'appointments',
    question: 'Can I book medical examinations or lab packages directly?',
    answer: 'Yes! From the home screen or "Services" tab, select "Lab Tests Booking" to browse available test packages, view pricing, and complete your reservation.',
  },
  {
    id: 'faq_4',
    category: 'account',
    question: 'How do I update my personal phone number or name?',
    answer: 'Go to "My Account" page, click on your profile card to edit your basic information. If your mobile number changes, a quick verification code will be sent to secure your medical data.',
  },
  {
    id: 'faq_5',
    category: 'account',
    question: 'How can I request permanent deletion of my account and data?',
    answer: 'You can navigate to the "Delete Account" screen from the Account settings. Confirming the deletion wipes your personal login credentials immediately, while maintaining mandatory legal medical archives as required by health regulations.',
  },
  {
    id: 'faq_6',
    category: 'technical',
    question: 'What should I do if the app fails to load or shows a connection error?',
    answer: 'Please ensure you have an active internet connection, pull down to refresh the screen, or restart the application. If the problem persists, please submit a support ticket below or message us via WhatsApp.',
  },
];

// 3. Computed (computed properties)
const filteredFaqs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return faqs.filter((item) => {
    const matchesCategory = selectedCategory.value === 'all' || item.category === selectedCategory.value;
    if (!matchesCategory) return false;

    if (!query) return true;
    const questionText = t(item.question).toLowerCase();
    const answerText = t(item.answer).toLowerCase();
    const rawQuestion = item.question.toLowerCase();
    return questionText.includes(query) || answerText.includes(query) || rawQuestion.includes(query);
  });
});

// 4. Methods (functions, handlers)
const toggleItem = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const onRateFeedback = (id: string, rating: 'yes' | 'no') => {
  feedbackState.value[id] = rating;
  showToast({
    type: 'success',
    title: t('Feedback Received'),
    message: t('Thank you for helping us improve our support content.'),
  });
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.support-faq-section {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .faq-section-header {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .faq-title-box {
      .section-title {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--unity-text-main, #0f172a);
        margin: 0;
      }

      .section-subtitle {
        font-size: 0.76rem;
        color: var(--unity-text-secondary, #64748b);
        margin: 3px 0 0;
      }
    }
  }

  .faq-search-box {
    position: relative;
    display: flex;
    align-items: center;

    .search-icon {
      position: absolute;
      inset-inline-start: 14px;
      color: var(--unity-text-secondary, #94a3b8);
      font-size: 0.9rem;
      pointer-events: none;
    }

    .faq-search-input {
      width: 100%;
      height: 44px;
      padding-inline-start: 38px;
      padding-inline-end: 36px;
      border-radius: 12px;
      border: 1px solid var(--unity-border, #e2e8f0);
      background: var(--unity-surface, #ffffff);
      color: var(--unity-text-main, #0f172a);
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &:focus {
        border-color: var(--unity-primary, #059669);
        box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
      }
    }

    .clear-search-btn {
      position: absolute;
      inset-inline-end: 12px;
      background: none;
      border: none;
      color: var(--unity-text-secondary, #94a3b8);
      cursor: pointer;
      padding: 4px;
      font-size: 0.8rem;
    }
  }

  .faq-category-pills {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }

    .category-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 20px;
      background: var(--unity-surface, #ffffff);
      border: 1px solid var(--unity-border, #e2e8f0);
      color: var(--unity-text-secondary, #64748b);
      font-size: 0.76rem;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s ease;

      i {
        font-size: 0.8rem;
      }

      &.active {
        background: var(--unity-primary, #059669);
        color: #ffffff;
        border-color: var(--unity-primary, #059669);
        box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);
      }
    }
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .faq-item {
    background: var(--unity-surface, #ffffff);
    border: 1px solid var(--unity-border, #e2e8f0);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &.expanded {
      border-color: rgba(5, 150, 105, 0.35);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .faq-question-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: none;
      border: none;
      text-align: inherit;
      cursor: pointer;
      color: inherit;

      .question-prefix-icon {
        color: var(--unity-primary, #059669);
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      .question-text {
        flex: 1;
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--unity-text-main, #0f172a);
        line-height: 1.35;
      }

      .toggle-icon {
        font-size: 0.8rem;
        color: var(--unity-text-secondary, #94a3b8);
        flex-shrink: 0;
      }
    }

    .faq-answer-container {
      padding: 0 16px 14px;

      .answer-content {
        padding-top: 6px;
        border-top: 1px dashed var(--unity-border, #e2e8f0);

        .answer-text {
          font-size: 0.8rem;
          color: var(--unity-text-secondary, #475569);
          line-height: 1.6;
          margin: 0 0 12px;
        }

        .feedback-prompt {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid rgba(0, 0, 0, 0.04);

          .prompt-text {
            font-size: 0.72rem;
            color: var(--unity-text-secondary, #64748b);
          }

          .feedback-actions {
            display: flex;
            gap: 6px;

            .feedback-btn {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 4px 10px;
              border-radius: 8px;
              background: var(--unity-surface-muted, #f8fafc);
              border: 1px solid var(--unity-border, #e2e8f0);
              color: var(--unity-text-secondary, #64748b);
              font-size: 0.72rem;
              cursor: pointer;
              transition: all 0.15s ease;

              &.selected {
                background: rgba(5, 150, 105, 0.1);
                color: #059669;
                border-color: #059669;
                font-weight: 700;
              }
            }
          }
        }
      }
    }
  }

  .faq-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 16px;
    background: var(--unity-surface, #ffffff);
    border: 1px dashed var(--unity-border, #e2e8f0);
    border-radius: 16px;
    text-align: center;

    .empty-icon-shell {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--unity-surface-muted, #f8fafc);
      color: var(--unity-text-secondary, #94a3b8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      margin-bottom: 10px;
    }

    .empty-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--unity-text-main, #0f172a);
      margin: 0 0 4px;
    }

    .empty-desc {
      font-size: 0.75rem;
      color: var(--unity-text-secondary, #64748b);
      margin: 0;
      max-width: 260px;
    }
  }
}
</style>
