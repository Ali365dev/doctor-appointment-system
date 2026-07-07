# Project Structure

```
├── app
│   ├── (auth)
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── otp
│   │   ├── register
│   │   └── layout.tsx
│   ├── (public)
│   │   ├── about
│   │   ├── appointment
│   │   ├── book-appointment
│   │   │   ├── step-1
│   │   │   │   └── page.tsx
│   │   │   ├── step-2
│   │   │   │   └── page.tsx
│   │   │   ├── step-3
│   │   │   │   └── page.tsx
│   │   │   ├── step-4
│   │   │   │   └── page.tsx
│   │   │   ├── step-5
│   │   │   │   └── page.tsx
│   │   │   ├── success
│   │   │   │   └── page.tsx
│   │   │   └── upload-receipt
│   │   │       └── page.tsx
│   │   ├── clinic
│   │   ├── contact
│   │   ├── services
│   │   ├── dr_zaid_gul_logo.svg
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── admin
│   │   ├── appointments
│   │   │   ├── verify
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── cms
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   ├── clinical
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── messages
│   │   │   └── page.tsx
│   │   ├── patients
│   │   │   └── page.tsx
│   │   ├── payments
│   │   │   └── page.tsx
│   │   ├── reports
│   │   ├── reviews
│   │   ├── schedule
│   │   ├── settings
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api
│   └── patient
│       ├── appointments
│       │   └── page.tsx
│       ├── chat
│       ├── dashboard
│       │   └── page.tsx
│       ├── medical-records
│       ├── payments
│       ├── profile
│       │   └── page.tsx
│       ├── settings
│       │   └── page.tsx
│       └── layout.tsx
├── components
│   ├── admin
│   │   ├── AppointmentVerificationContent.tsx
│   │   ├── MessagingContent.tsx
│   │   ├── PaymentVerificationContent.tsx
│   │   ├── SettingsContent.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── appointment
│   │   ├── BookingSidebar.tsx
│   │   ├── BookingStep1Form.tsx
│   │   ├── BookingStep2Content.tsx
│   │   ├── BookingStep3Content.tsx
│   │   ├── BookingStep4Content.tsx
│   │   ├── BookingStep5Content.tsx
│   │   ├── BookingStepper.tsx
│   │   └── UploadReceiptContent.tsx
│   ├── auth
│   │   ├── DoctorForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── LoginHero.tsx
│   │   ├── PatientForm.tsx
│   │   └── RoleToggle.tsx
│   ├── chat
│   ├── common
│   │   └── ReviewsCarousel.tsx
│   ├── forms
│   ├── layout
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   ├── patient
│   │   ├── AppointmentTable.tsx
│   │   ├── PatientSidebar.tsx
│   │   ├── PatientTopBar.tsx
│   │   ├── ProfileForm.tsx
│   │   └── SettingsContent.tsx
│   ├── payment
│   └── ui
├── desgin
│   ├── appointments
│   │   ├── book_appointment_step_1
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── book_appointment_step_2
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── book_appointment_step_3_patient_details
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── book_appointment_step_4
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── book_appointment_step_5_payment
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── clinical_precision
│   │   │   └── DESIGN.md
│   │   ├── payment_submission_success
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   └── upload_payment_receipt
│   │       ├── code.html
│   │       └── screen.png
│   ├── doctor
│   │   ├── clinical_precision
│   │   │   └── DESIGN.md
│   │   ├── doctor_dashboard_appointment_verification
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── doctor_dashboard_appointments_management
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── doctor_dashboard_clinical_overview
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── doctor_dashboard_layout
│   │   │   ├── DESIGN.md
│   │   │   └── screen.png
│   │   ├── doctor_dashboard_messaging_center
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── doctor_dashboard_overview
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── doctor_dashboard_patient_table_view
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── doctor_dashboard_payment_verification_workflow
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   ├── doctor_dashboard_settings_management
│   │   │   ├── code.html
│   │   │   └── screen.png
│   │   └── doctor_dashboard_website_cms
│   │       ├── code.html
│   │       └── screen.png
│   ├── home
│   │   ├── code.html
│   │   ├── DESIGN.md
│   │   └── screen.png
│   └── patient
│       ├── clinical_precision
│       │   └── DESIGN.md
│       ├── patient_dashboard_layout
│       │   └── screen.png
│       ├── patient_dashboard_premium_chatbox_experience_1
│       │   ├── code.html
│       │   └── screen.png
│       ├── patient_dashboard_profile_page
│       │   └── screen.png
│       └── patient_dashboard_settings_page
│           ├── code.html
│           └── screen.png
├── docs
│   ├── architecture.md
│   ├── components.md
│   ├── database.md
│   ├── folder-structure.md
│   ├── style.md
│   └── workflow.md
├── hooks
│   ├── useAppointments.ts
│   ├── useAuth.ts
│   ├── useChat.ts
│   ├── useDoctor.ts
│   ├── usePatients.ts
│   └── usePayments.ts
├── lib
│   ├── constants.ts
│   ├── queryClient.ts
│   ├── queryKeys.ts
│   ├── theme.ts
│   ├── utils.ts
│   └── validators.ts
├── providers
│   ├── AuthProvider.tsx
│   ├── QueryProvider.tsx
│   └── ThemeProvider.tsx
├── public
│   ├── icons
│   ├── images
│   ├── logo
│   ├── dr_zaid_gul_logo_navbar.svg
│   ├── dr_zaid_gul_logo.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── services
│   ├── api
│   │   ├── appointment.ts
│   │   ├── chat.ts
│   │   ├── doctor.ts
│   │   ├── patient.ts
│   │   ├── payment.ts
│   │   └── review.ts
│   ├── firebase
│   │   ├── auth.ts
│   │   └── config.ts
│   ├── cloudinary
│   │   ├── config.ts
│   │   ├── upload.ts
│   │   ├── delete.ts
│   │   └── index.ts
│   └── mongodb
│       ├── connection.ts
│       ├── index.ts
│       ├── models
│       │   ├── User.ts
│       │   ├── Patient.ts
│       │   ├── Doctor.ts
│       │   ├── Appointment.ts
│       │   ├── Payment.ts
│       │   ├── MedicalRecord.ts
│       │   ├── Chat.ts
│       │   ├── Review.ts
│       │   ├── Clinic.ts
│       │   ├── Cms.ts
│       │   └── Notification.ts
│       ├── repositories
│       └── types.ts
├── store
│   ├── authStore.ts
│   ├── bookingStore.ts
│   ├── chatStore.ts
│   └── uiStore.ts
├── types
│   ├── api.ts
│   ├── appointment.ts
│   ├── doctor.ts
│   ├── patient.ts
│   └── payment.ts
├── AGENTS.md
├── CLAUDE.md
├── data.json
├── env.d.ts
├── eslint.config.mjs
├── help.text
├── middleware.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```
