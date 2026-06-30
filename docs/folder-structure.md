# Project Structure

```
├── app
│   ├── (auth)
│   │   ├── login
│   │   ├── otp
│   │   ├── register
│   │   └── layout.tsx
│   ├── (public)
│   │   ├── about
│   │   ├── clinic
│   │   ├── contact
│   │   ├── services
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── admin
│   │   ├── appointments
│   │   ├── dashboard
│   │   ├── messages
│   │   ├── patients
│   │   ├── payments
│   │   ├── reports
│   │   ├── reviews
│   │   ├── schedule
│   │   └── settings
│   ├── api
│   └── patient
│       ├── appointments
│       ├── chat
│       ├── dashboard
│       ├── medical-records
│       ├── payments
│       └── profile
├── components
│   ├── admin
│   ├── appointment
│   ├── auth
│   │   ├── DoctorForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── LoginHero.tsx
│   │   ├── PatientForm.tsx
│   │   └── RoleToggle.tsx
│   ├── chat
│   ├── common
│   ├── forms
│   ├── layout
│   ├── patient
│   ├── payment
│   └── ui
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
│   └── supabase
│       └── client.ts
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
