import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotificationsPage from './pages/NotificationsPage';

import BrowseEventsPage from './pages/student/BrowseEventsPage';
import EventDetailPage from './pages/student/EventDetailPage';
import MyRegistrationsPage from './pages/student/MyRegistrationsPage';

import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage';
import CreateEventPage from './pages/organizer/CreateEventPage';
import OrganizerEventDetailPage from './pages/organizer/OrganizerEventDetailPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminManageEventsPage from './pages/admin/AdminManageEventsPage';
import AdminManageVenuesPage from './pages/admin/AdminManageVenuesPage';

const ROLE_HOME = {
  STUDENT: '/student/events',
  ORGANIZER: '/organizer/events',
  ADMIN: '/admin/dashboard',
};

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="/student/events"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <BrowseEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/events/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <EventDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/registrations"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyRegistrationsPage />
              </ProtectedRoute>
            }
          />

          {/* Organizer routes */}
          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <OrganizerEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <OrganizerEventDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminManageEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/venues"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminManageVenuesPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
