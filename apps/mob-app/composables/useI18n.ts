import { ref, computed } from 'vue';
import ar from '../locales/ar';
import en from '../locales/en';

export type LocaleCode = 'ar' | 'en';

const currentLocale = ref<LocaleCode>('ar');

const dictionaries: Record<LocaleCode, Record<string, string>> = {
  ar,
  en,
};

// Aliases mapping old dot notation to clean English strings
const legacyDotAliases: Record<string, string> = {
  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.save': 'Save',
  'common.search': 'Search',
  'common.viewAll': 'View All',
  'common.loading': 'Loading...',
  'common.back': 'Back',
  'common.now': 'Now',
  'common.time': 'Time',
  'common.date': 'Date',
  'common.currency': 'SAR',
  'common.appName': 'Unity Medical',

  'nav.home': 'Home',
  'nav.services': 'Services',
  'nav.appointments': 'Appointments',
  'nav.records': 'Records',
  'nav.profile': 'Profile',
  'nav.doctors': 'Doctors',
  'nav.quickBookAria': 'What would you like to book today?',

  'records.pageTitle': 'Medical Records & Lab Tests',
  'records.tabReports': 'Visit Reports',
  'records.tabLabs': 'Lab Results',
  'records.tabPrescriptions': 'Prescriptions',
  'records.downloadPdf': 'Download Report (PDF)',
  'records.viewPrescription': 'View Prescription',
  'records.emptyTitle': 'No medical records found',
  'records.emptySub': 'Your medical visit reports, lab diagnostics and doctor prescriptions will appear here.',

  'quickBook.modalTitle': 'What would you like to book today?',
  'quickBook.modalSubtitle': 'Choose a medical service or doctor for immediate assistance',
  'quickBook.doctorTitle': 'Doctor Consultation',
  'quickBook.doctorBadge': 'Certified Care',
  'quickBook.doctorDesc': 'Book an appointment with top specialist consultants across all disciplines',
  'quickBook.doctorImmediate': 'Instant slots',
  'quickBook.doctorFormat': 'In-person or Video',
  'quickBook.serviceTitle': 'Medical Service or Lab Test',
  'quickBook.serviceBadge': 'All-in-One',
  'quickBook.serviceDesc': 'Comprehensive lab packages, X-rays, home nursing, and physiotherapy',
  'quickBook.serviceHomeVisit': 'Home visit available',
  'quickBook.serviceFastResult': 'Rapid results',

  'home.location': 'Riyadh, Al-Nakheel District',
  'home.welcomePrefix': 'Welcome,',
  'home.heroTitle': 'How are you feeling today?',
  'home.heroSubtitle': 'Get the finest healthcare for you and your family at your fingertips',
  'home.searchPlaceholder': 'Search for doctor, test, scan, or service...',
  'home.liveBanner': 'Instant consultations available now with certified doctors • 24/7 Service',
  'home.categoriesTitle': 'What are you looking for today?',
  'home.browseServices': 'Browse Services',
  'home.upcomingTitle': 'Upcoming Appointments',
  'home.topDoctorsTitle': 'Certified Top Doctors',
  'home.pastRecordsTitle': 'My Past Bookings',
  'home.visitHistory': 'Visit History',
  'home.bookAppointment': 'Book Slot',
  'home.reschedule': 'Reschedule',
  'home.viewProfile': 'View Profile',
  'home.viewReport': 'View Report',
  'home.rebook': 'Rebook',
  'home.downloadResult': 'Download Results',
  'home.requestAgain': 'Request Again',

  'auth.loginTitle': 'Sign In',
  'auth.registerTitle': 'Create New Account',
  'auth.quickAccessDivider': 'Or via quick access',
  'auth.nafathLogin': 'National Nafath',
  'auth.biometricLogin': 'Biometric Access',
  'auth.noAccountYet': "Don't have an account?",
  'auth.createNewAccount': 'Create New Account',
  'auth.haveAccount': 'Already have an account?',
  'auth.loginNow': 'Sign In',
  'auth.otpTitle': 'Auth Confirm Otp',
  'auth.otpHeaderBadge': 'Secure Verify',
  'auth.confirmAndContinue': 'Confirm & Continue',
  'auth.clear': 'Clear',
  'auth.otpSecurityNotice': 'Verification code is for your use only, do not share it with anyone.',
  'auth.otpSentTo': 'Enter the verification code sent to',
  'auth.resendCode': 'Resend Code',
  'auth.resendIn': 'Resend in',
  'auth.enterCode': 'Enter Code',

  'profile.pageTitle': 'Profile & Settings',
  'profile.headerBadge': 'Sehaty Care',
  'profile.fileNumber': 'File No:',
  'profile.groupHealthAndFamily': 'Health Care & Family',
  'profile.familyMembers': 'Family Members Management',
  'profile.familyMembersSub': 'Add or manage dependents health profiles',
  'profile.insuranceCard': 'Health Insurance Card',
  'profile.insuranceCardSub': 'View & update insurance and claim submissions',
  'profile.medicationAlerts': 'Appointments & Medication Alerts',
  'profile.medicationAlertsSub': 'Customize notifications & dosage reminders',
  'profile.groupPaymentsAndSecurity': 'Payments & Security',
  'profile.paymentsAndWallet': 'Payment Methods & Wallet',
  'profile.paymentsAndWalletSub': 'Saved cards & cashback balance',
  'profile.privacyAndSecurity': 'Privacy & Security',
  'profile.privacyAndSecuritySub': 'Face ID / Quick access & change password',
  'profile.groupHelpAndLegal': 'Help & Legal Information',
  'profile.helpAndSupport': 'Help & Technical Support',
  'profile.helpAndSupportSub': 'Instant chat with customer care 24/7',
  'profile.termsAndPolicies': 'Terms & Medical Use Policies',
  'profile.termsAndPoliciesSub': 'Data protection & health records privacy',
  'profile.mohCompliance': 'Compliant with Saudi Ministry of Health standards',
  'profile.appVersion': 'Sehaty Care App • Version 2.4.1 (Build 890)',
  'profile.logout': 'Log Out of Account',
  'profile.emailOrPhone': 'Email or Mobile Phone',
  'profile.password': 'Password',

  'booking.title': 'Confirm & Pay Booking',
  'booking.timerHold': 'Appointment held temporarily for 15 minutes',
  'booking.scheduledAppointment': 'Selected Slot',
  'booking.clinicBranch': 'Clinic Location',
  'booking.availableTimesToday': 'Available slots for this date',
  'booking.feeSummary': 'Fee Summary',
  'booking.taxIncluded': 'Incl. 15% VAT',
  'booking.consultationFee': 'Specialist Consultation Fee',
  'booking.insuranceDiscount': 'Healthcare Partner Discount',
  'booking.totalPayment': 'Total Payable Amount',
  'booking.approvedFeeNote': 'Final approved fees',
  'booking.paymentMethod': 'Payment Method',
  'booking.secureEncryption': 'Bank-grade encryption',
  'booking.applePay': 'Apple Pay',
  'booking.applePaySub': 'Fast single-touch checkout',
  'booking.cardPay': 'Mada / Visa Card (Paymob)',
  'booking.cardPaySub': 'Mada, Visa, Mastercard',
  'booking.cashPay': 'Pay on Arrival',
  'booking.cashPaySub': 'At clinic reception desk',
  'booking.confirmPayment': 'Complete Payment & Confirm',
  'booking.freeCancellation': 'Free cancellation up to 2 hours before visit',
  'booking.successTitle': 'Booking Confirmed Successfully!',
  'booking.successSub': 'Details and booking reference have been sent to your phone and notifications.',

  'appointments.pageTitle': 'My Bookings & Appointments',
  'appointments.tabUpcoming': 'Upcoming',
  'appointments.tabCompleted': 'Completed',
  'appointments.tabCancelled': 'Cancelled',
  'appointments.statusConfirmed': 'Confirmed',
  'appointments.statusPending': 'Pending Review',
  'appointments.statusCompleted': 'Completed',
  'appointments.statusCancelled': 'Cancelled',
  'appointments.paidFull': 'Fully Paid',
  'appointments.payAtDesk': 'Pay at Reception',
  'appointments.cancelApt': 'Cancel Appointment',
  'appointments.modifyApt': 'Modify Slot',
  'appointments.viewMedicalReport': 'View Medical Report',
  'appointments.emptyTitle': 'No appointments in this section',
  'appointments.emptySub': 'You can book a new appointment anytime with our top specialists',
  'appointments.bookNow': 'Book Appointment Now',

  'servicesCatalog.pageTitle': 'Medical Services & Clinics',
  'servicesCatalog.tabServices': 'Services & Labs',
  'servicesCatalog.tabDoctors': 'Top Specialists',
  'servicesCatalog.searchServicesPlaceholder': 'Search service, lab test, or radiology...',
  'servicesCatalog.searchDoctorsPlaceholder': 'Search by doctor name or specialty...',
  'servicesCatalog.bookThisService': 'Book This Service',
  'servicesCatalog.bookConsultation': 'Book Consultation',
  'servicesCatalog.consultationPrice': 'Fee:',
  'servicesCatalog.availableNow': 'Available now',
};

export function useI18n() {
  const isRtl = computed(() => currentLocale.value === 'ar');

  const setLocale = (lang: LocaleCode) => {
    currentLocale.value = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('unity_locale', lang);
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
  };

  const initLocale = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unity_locale') as LocaleCode | null;
      if (saved && (saved === 'ar' || saved === 'en')) {
        setLocale(saved);
      } else {
        setLocale('ar');
      }
    }
  };

  /**
   * Bya3 Flat Translation function:
   * t("Medical Records & Lab Tests") -> returns Arabic translation in 'ar', English text in 'en'.
   */
  const t = (key: string, fallback?: string): string => {
    if (!key) return '';

    // Resolve legacy dot paths if any are passed
    const resolvedKey = legacyDotAliases[key] || key;

    const dict = dictionaries[currentLocale.value] || dictionaries.ar;

    // Flat lookup: "English Key": "Arabic Translation"
    if (dict && typeof dict === 'object' && resolvedKey in dict && typeof dict[resolvedKey] === 'string') {
      return dict[resolvedKey];
    }

    // In English mode, if not in dict, the key itself is already English!
    if (currentLocale.value === 'en') {
      return fallback || resolvedKey;
    }

    // In Arabic mode, if missing, check English dictionary or return key
    return fallback || resolvedKey;
  };

  return {
    locale: currentLocale,
    isRtl,
    setLocale,
    initLocale,
    t,
  };
}
