import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { store } from './store';
import { RootState } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import { Box, CircularProgress, Typography, Container, Alert } from '@mui/material';
import { setCredentials } from './store/slices/authSlice';
import type { UserRole } from './store/slices/authSlice';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Shared pages
import AccountSettings from './pages/AccountSettings';

// Talent pages
import TalentDashboard from './pages/talent/TalentDashboard';
import TalentCalendarPage from './pages/talent/TalentCalendarPage';
import TalentHistoryPage from './pages/talent/TalentHistoryPage';
import TalentOnboardingPage from './pages/talent/TalentOnboardingPage';
import TalentProfileEditPage from './pages/talent/TalentProfileEditPage';
import TalentDetailPage from './pages/talent/TalentDetailPage';

// Scout pages
import ScoutDashboard from './pages/scout/ScoutDashboard';
import ScoutTalentList from './pages/scout/ScoutTalentList';
import ScoutOnboardingPage from './pages/scout/ScoutOnboardingPage';

// Team pages
import TeamList from './pages/teams/TeamList';
import TeamDetail from './pages/teams/TeamDetail';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TeamManagement from './pages/admin/TeamManagement';
import DataManagement from './pages/admin/DataManagement';
import MatchCalendarManagement from './pages/admin/MatchCalendarManagement';

// Add error boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please check the console for details.</div>;
    }
    return this.props.children;
  }
}

// Add RoleBasedRedirect component
const RoleBasedRedirect = () => {
  const { userRole } = useSelector((state: RootState) => state.auth);
  
  switch (userRole) {
    case 'TALENT':
      return <Navigate to="/talent/dashboard" replace />;
    case 'SCOUT':
      return <Navigate to="/scout/dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');
    if (token && user && userRole) {
      dispatch(setCredentials({
        token,
        userRole: userRole as UserRole,
        user: JSON.parse(user)
      }));
    }
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CssBaseline />
        <NotificationProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route element={<Layout />}>
                {/* Talent routes */}
                <Route
                  path="/talent/create"
                  element={
                    <ProtectedRoute allowedRoles={['TALENT']}>
                      <TalentOnboardingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/talent/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['TALENT']}>
                      <TalentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/talent/calendar"
                  element={
                    <ProtectedRoute allowedRoles={['TALENT']}>
                      <TalentCalendarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/talent/history"
                  element={
                    <ProtectedRoute allowedRoles={['TALENT']}>
                      <TalentHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/talent/profile/edit"
                  element={
                    <ProtectedRoute allowedRoles={['TALENT']}>
                      <TalentProfileEditPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Talent detail page (accessible by scouts and admins) */}
                <Route
                  path="/talent/:id"
                  element={
                    <ProtectedRoute allowedRoles={['SCOUT', 'ADMIN']}>
                      <TalentDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Scout routes */}
                <Route
                  path="/scout/create"
                  element={
                    <ProtectedRoute allowedRoles={['SCOUT']}>
                      <ScoutOnboardingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scout/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['SCOUT']}>
                      <ScoutDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scout/talents"
                  element={
                    <ProtectedRoute allowedRoles={['SCOUT']}>
                      <ScoutTalentList />
                    </ProtectedRoute>
                  }
                />

                {/* Team routes (shared) */}
                <Route
                  path="/teams"
                  element={
                    <ProtectedRoute>
                      <TeamList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams/:id"
                  element={
                    <ProtectedRoute>
                      <TeamDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Account Settings (shared by all users) */}
                <Route
                  path="/account/settings"
                  element={
                    <ProtectedRoute>
                      <AccountSettings />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/teams"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <TeamManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/data"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <DataManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/matches"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <MatchCalendarManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Redirect to appropriate dashboard based on role */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRedirect />
                    </ProtectedRoute>
                  }
                />

                {/* Redirect to login if no route matches */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const AppWrapper = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default AppWrapper; 