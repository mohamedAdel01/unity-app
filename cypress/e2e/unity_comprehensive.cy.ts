describe('Unity Medical Mobile App — Comprehensive E2E Test Suite', () => {
  const mockAdminUser = {
    id: 'usr_test_admin',
    name: 'د. فيصل القحطاني',
    email: 'admin@unity-clinics.com',
    phone: '+966501234567',
    role: 'admin',
    status: 'active',
  };

  const mockPatientUser = {
    id: 'usr_test_patient',
    name: 'سارة خالد المنصور',
    email: 'sara@example.com',
    phone: '+966509876543',
    role: 'patient',
    status: 'active',
  };

  const visitAsAdmin = (path: string) => {
    return cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('unity_token', 'test-jwt-admin-token');
        win.localStorage.setItem('unity_user', JSON.stringify(mockAdminUser));
        win.localStorage.setItem('unity_locale', 'ar');
      },
    });
  };

  const visitAsPatient = (path: string) => {
    return cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('unity_token', 'test-jwt-patient-token');
        win.localStorage.setItem('unity_user', JSON.stringify(mockPatientUser));
        win.localStorage.setItem('unity_locale', 'ar');
      },
    });
  };

  beforeEach(() => {
    // Set mobile viewport (iPhone 14 standard: 390x844)
    cy.viewport(390, 844);
  });

  // ==========================================
  // 1. ONBOARDING SCREEN & FIRST-TIME FLOW
  // ==========================================
  describe('Onboarding & Initial Experience', () => {
    it('shows onboarding when unauthenticated and navigates on skip', () => {
      cy.clearLocalStorage();
      cy.visit('/');
      cy.get('.onboarding-container', { timeout: 10000 }).should('be.visible');
      cy.get('.skip-btn').should('be.visible').click();
      cy.url().should('include', '/auth/register');
    });
  });

  // ==========================================
  // 2. CORE PATIENT PAGES & BOTTOM NAVIGATION
  // ==========================================
  describe('Bottom Navigation & Patient Screens (Authenticated)', () => {
    it('loads Home dashboard with header and categories', () => {
      visitAsAdmin('/');
      cy.get('.home-screen', { timeout: 10000 }).should('be.visible');
      cy.get('.app-header').should('be.visible');
      cy.get('.categories-grid').should('be.visible');
      cy.get('.bottom-nav-bar').should('be.visible');
    });

    it('navigates to Services Catalog tab', () => {
      visitAsAdmin('/services');
      cy.get('.services-page', { timeout: 10000 }).should('be.visible');
    });

    it('navigates to Appointments tab', () => {
      visitAsAdmin('/appointments');
      cy.get('.appointments-page', { timeout: 10000 }).should('be.visible');
      cy.get('.page-top-header').should('be.visible');
    });

    it('navigates to Medical Records tab', () => {
      visitAsPatient('/records');
      cy.get('.records-page', { timeout: 10000 }).should('be.visible');
      cy.get('.records-header').should('be.visible');
    });

    it('navigates to Profile & Settings tab', () => {
      visitAsAdmin('/profile');
      cy.get('.profile-page', { timeout: 10000 }).should('be.visible');
      cy.get('.profile-menu-groups').should('be.visible');
    });
  });

  // ==========================================
  // 3. STORE COMPLIANCE & LEGAL PAGES
  // ==========================================
  describe('Store Compliance Pages (Google Play & Apple)', () => {
    it('displays Terms & Privacy Policy page with all regulatory sections', () => {
      cy.visit('/terms');
      cy.get('.terms-page', { timeout: 10000 }).should('be.visible');
      cy.get('.page-title').should('be.visible');
      cy.get('.policy-section').should('have.length.at.least', 5);
      cy.get('.back-btn').should('be.visible');
    });

    it('displays Delete Account page with notice, survey and confirmation', () => {
      visitAsPatient('/delete-account');
      cy.get('.delete-account-page', { timeout: 10000 }).should('be.visible');
      cy.get('.page-title').should('be.visible');
      cy.get('.warning-box').should('be.visible');
      cy.get('.reasons-chips').should('be.visible');
      cy.get('.delete-btn').should('be.disabled');

      // Check acknowledgment checkbox
      cy.get('input.checkbox-input').check({ force: true });
      cy.get('.delete-btn').should('not.be.disabled');
    });
  });

  // ==========================================
  // 4. AUTHENTICATION SCREENS (GUEST MODE)
  // ==========================================
  describe('Authentication Flow', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
    });

    it('renders login screen with phone input and submit button', () => {
      cy.visit('/auth/login');
      cy.get('.auth-page', { timeout: 10000 }).should('be.visible');
      cy.get('.phone-input-shell').should('be.visible');
      cy.get('.submit-login-btn').should('be.visible');
    });

    it('renders register screen with 3-step indicator', () => {
      cy.visit('/auth/register');
      cy.get('.auth-page', { timeout: 10000 }).should('be.visible');
      cy.get('.step-progress-header').should('be.visible');
      cy.get('.phone-input-shell').should('be.visible');
    });
  });

  // ==========================================
  // 5. ADMIN PORTAL SCREENS & MANAGEMENT
  // ==========================================
  describe('Admin Portal Management', () => {
    it('loads Admin Dashboard overview with KPIs', () => {
      visitAsAdmin('/admin');
      cy.get('.admin-dashboard-page', { timeout: 10000 }).should('be.visible');
      cy.get('.metrics-grid').should('be.visible');
      cy.get('.nav-tiles-grid').should('be.visible');
    });

    it('loads Admin Patients Management', () => {
      visitAsAdmin('/admin/patients');
      cy.get('.admin-patients-page', { timeout: 10000 }).should('be.visible');
      cy.get('.admin-patients-header').should('be.visible');
    });

    it('loads Admin Doctors & Rosters Management', () => {
      visitAsAdmin('/admin/doctors');
      cy.get('.admin-doctors-page', { timeout: 10000 }).should('be.visible');
      cy.get('.admin-doctors-header').should('be.visible');
    });

    it('loads Admin Clinics & Departments', () => {
      visitAsAdmin('/admin/clinics');
      cy.get('.admin-clinics-page', { timeout: 10000 }).should('be.visible');
      cy.get('.supervisor-top-bar').should('be.visible');
    });

    it('loads Admin Bookings & Invoicing', () => {
      visitAsAdmin('/admin/appointments');
      cy.get('.admin-bookings-page', { timeout: 10000 }).should('be.visible');
      cy.get('.admin-bookings-header').should('be.visible');
    });

    it('loads Admin Promotions & Deals Management', () => {
      visitAsAdmin('/admin/promotions');
      cy.get('.admin-promotions-page', { timeout: 10000 }).should('be.visible');
      cy.get('.admin-promotions-header').should('be.visible');
    });
  });

  // ==========================================
  // 6. QUICK BOOK MODAL INTERACTION
  // ==========================================
  describe('Quick Book & Modal Interactions', () => {
    it('opens Quick Book modal from floating action button', () => {
      visitAsAdmin('/');
      cy.get('.center-fab-btn', { timeout: 10000 }).click();
      cy.get('.modal-sheet', { timeout: 6000 }).should('be.visible');
      cy.get('.options .option').should('have.length', 2);
      cy.get('.close-btn').click();
    });
  });
});
