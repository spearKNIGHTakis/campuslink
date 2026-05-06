// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/hooks/useAuth'
import PrivateRoute from '@/components/layout/PrivateRoute'
import AppShell from '@/components/layout/AppShell'

// Auth pages
import Login           from '@/pages/Login'
import Register        from '@/pages/Register'
import ForgotPassword  from '@/pages/ForgotPassword'
import VerifyEmail     from '@/pages/VerifyEmail'
import UploadID        from '@/pages/UploadID'
import PendingApproval from '@/pages/PendingApproval'
import Onboarding      from '@/pages/Onboarding'

// Core pages
import Feed        from '@/pages/Feed'
import Profile     from '@/pages/Profile'
import Friends     from '@/pages/Friends'
import Groups      from '@/pages/Groups'
import Events      from '@/pages/Events'
import Messages    from '@/pages/Messages'
import Admin       from '@/pages/Admin'
import UserProfile from '@/pages/UserProfile'
import GetVerified    from '@/pages/GetVerified'
import Explore        from '@/pages/Explore'
import Notifications  from '@/pages/Notifications'

// New pages
import Search      from '@/pages/Search'
import Leaderboard from '@/pages/Leaderboard'
import Marketplace from '@/pages/Marketplace'
import GPA         from '@/pages/GPA'
import Assignments from '@/pages/Assignments'
import StudyRooms  from '@/pages/StudyRooms'

import { B } from '@/lib/theme'

function Shell({ children }) {
  return (
    <PrivateRoute>
      <AppShell>{children}</AppShell>
    </PrivateRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1E0A35',
            color: '#EDE8FF',
            border: `1px solid ${B.inkLight}`,
            borderRadius: 12,
            fontSize: 13,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          },
          success: { iconTheme: { primary: B.mint,  secondary: '#1E0A35' } },
          error:   { iconTheme: { primary: B.coral, secondary: '#1E0A35' } },
        }}
      />

      <Routes>
        {/* ── Public ── */}
        <Route path="/login"            element={<Login />} />
        <Route path="/register"         element={<Register />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/verify-email"     element={<VerifyEmail />} />
        <Route path="/upload-id"        element={<UploadID />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        {/* ── Onboarding ── */}
        <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

        {/* ── Core app ── */}
        <Route path="/feed"        element={<Shell><Feed /></Shell>} />
        <Route path="/profile"     element={<Shell><Profile /></Shell>} />
        <Route path="/profile/:id" element={<Shell><UserProfile /></Shell>} />
        <Route path="/friends"     element={<Shell><Friends /></Shell>} />
        <Route path="/groups"      element={<Shell><Groups /></Shell>} />
        <Route path="/events"      element={<Shell><Events /></Shell>} />
        <Route path="/messages"    element={<Shell><Messages /></Shell>} />
        <Route path="/admin"       element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/get-verified"   element={<PrivateRoute><GetVerified /></PrivateRoute>} />
        <Route path="/explore"         element={<Shell><Explore /></Shell>} />
        <Route path="/notifications"   element={<Shell><Notifications /></Shell>} />

        {/* ── New features ── */}
        <Route path="/search"      element={<Shell><Search /></Shell>} />
        <Route path="/leaderboard" element={<Shell><Leaderboard /></Shell>} />
        <Route path="/marketplace" element={<Shell><Marketplace /></Shell>} />
        <Route path="/gpa"         element={<Shell><GPA /></Shell>} />
        <Route path="/assignments" element={<Shell><Assignments /></Shell>} />
        <Route path="/studyrooms"  element={<Shell><StudyRooms /></Shell>} />

        {/* ── Redirects ── */}
        <Route path="/"  element={<Navigate to="/feed" replace />} />
        <Route path="*"  element={<Navigate to="/feed" replace />} />
      </Routes>
    </AuthProvider>
  )
}
