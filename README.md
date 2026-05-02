# CampusLink 🔗

> The university-only social network for KNUST students.  
> Built with React + Vite + Firebase. Purple-themed. Mobile-first PWA.

---

## Project Structure

```
campuslink/
├── public/
│   ├── favicon.svg
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx   # Header + bottom nav wrapper
│   │   │   └── PrivateRoute.jsx
│   │   └── ui/
│   │       ├── index.jsx      # All shared UI components
│   │       └── NotifDropdown.jsx
│   ├── hooks/
│   │   ├── useAuth.jsx        # Auth context + hook
│   │   └── useNotifications.js
│   ├── lib/
│   │   ├── firebase.js        # Firebase init
│   │   ├── db.js              # All Firestore operations
│   │   ├── storage.js         # Firebase Storage uploads
│   │   └── theme.js           # Brand tokens (purple palette)
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── VerifyEmail.jsx
│   │   ├── UploadID.jsx       # Student ID upload (step 2 verification)
│   │   ├── PendingApproval.jsx
│   │   ├── Onboarding.jsx     # Post-approval profile setup
│   │   ├── Feed.jsx           # Social feed
│   │   ├── Friends.jsx        # Requests, suggestions, search
│   │   ├── Groups.jsx         # Study groups
│   │   ├── Events.jsx         # Campus events + RSVP
│   │   ├── Messages.jsx       # Real-time DMs
│   │   ├── Profile.jsx        # Profile view + edit
│   │   └── Admin.jsx          # Verification queue dashboard
│   ├── store/
│   │   └── useStore.js        # Zustand global state
│   ├── App.jsx                # Router + all routes
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Required Firestore indexes
├── storage.rules              # Storage security rules
├── firebase.json              # Firebase hosting config
├── .env.example               # Environment variable template
├── vite.config.js
└── package.json
```

---

## Setup Instructions (Windows)

### Step 1 — Clone / extract the project

Unzip `campuslink.zip` into your projects folder:
```
C:\Projects\campuslink
```

### Step 2 — Create Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `campuslink-knust` → Create
3. In the left sidebar, enable these services:
   - **Authentication** → Get started → Email/Password → Enable → Save
   - **Firestore Database** → Create database → Start in **test mode** → Choose `europe-west1` → Enable
   - **Storage** → Get started → Test mode → Done
4. Click the **Web icon** (`</>`) → register app name `campuslink-web` → Register
5. Copy the `firebaseConfig` object shown

### Step 3 — Configure environment variables

```bash
# In your project root, copy the example file:
copy .env.example .env
```

Open `.env` and paste your Firebase config values:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=campuslink-knust.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=campuslink-knust
VITE_FIREBASE_STORAGE_BUCKET=campuslink-knust.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

### Step 4 — Install dependencies

Open a terminal in the project folder:
```bash
npm install
```

### Step 5 — Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deploy Firestore Rules & Indexes

Install Firebase CLI (once):
```bash
npm install -g firebase-tools
firebase login
firebase init
# Select: Firestore, Storage, Hosting
# Use existing project: campuslink-knust
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

---

## Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at:
`https://campuslink-knust.web.app`

---

## User Flow

```
Register → Verify Email → Upload Student ID → Pending Approval
                                                      ↓
                                           Admin reviews at /admin
                                                      ↓
                                               Approve → Onboarding → Feed
```

### Admin setup

To grant admin access to a user:
1. Go to Firestore Console → `users` collection
2. Find the user document
3. Add field: `isAdmin: true`
4. That user can now access `/admin`

---

## Key Features

| Feature | Status |
|---|---|
| Multi-step student verification | ✅ |
| Real-time social feed | ✅ |
| Like & comment system | ✅ |
| Friend requests & discovery | ✅ |
| Study groups (join/create) | ✅ |
| Campus events + RSVP | ✅ |
| Real-time direct messaging | ✅ |
| Push notifications (in-app) | ✅ |
| Profile with photo upload | ✅ |
| Dark-mode purple theme | ✅ |
| PWA (installable) | ✅ |
| Admin verification dashboard | ✅ |
| Firestore security rules | ✅ |
| Firebase Storage rules | ✅ |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| State | Zustand |
| Backend / DB | Firebase Firestore |
| Auth | Firebase Auth |
| Storage | Firebase Storage |
| Toasts | react-hot-toast |
| File upload | react-dropzone |
| Dates | date-fns |
| Fonts | Plus Jakarta Sans |

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firestore project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud messaging ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## Brand

- **Primary colour:** `#A855F7` (Vibrant Purple)
- **Bg dark:** `#0D0118`
- **Surface dark:** `#1E0A35`
- **Accent:** `#FF6B6B` (coral for alerts)
- **Success:** `#06D6A0` (mint for online/RSVP)
- **Font:** Plus Jakarta Sans

---

*CampusLink — KNUST Pilot Programme*  
*Built for Ghanaian university students 🇬🇭*
