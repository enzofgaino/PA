
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import CreateAdminPage from '@/pages/CreateAdminPage';
import UserDashboard from '@/pages/UserDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import UserProfile from '@/pages/UserProfile';
import ConsumptionHistory from '@/pages/ConsumptionHistory';
import ConsumptionRegistration from '@/pages/ConsumptionRegistration';
import SolarCalculator from '@/pages/SolarCalculator';
import UserManagement from '@/pages/UserManagement';
import CreateUser from '@/pages/CreateUser';
import UserDetails from '@/pages/UserDetails';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Routes>
      <Route path="/auth/login" element={
        isAuthenticated ? 
          <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace /> : 
          <LoginPage />
      } />
      <Route path="/auth/create_admin" element={<CreateAdminPage />} />
      
      <Route path="/user/dashboard" element={
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/user/profile" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/user/history" element={
        <ProtectedRoute>
          <ConsumptionHistory />
        </ProtectedRoute>
      } />
      <Route path="/user/consumption" element={
        <ProtectedRoute>
          <ConsumptionRegistration />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/dashboard" element={
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/calculator" element={
        <ProtectedRoute adminOnly>
          <SolarCalculator />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute adminOnly>
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/users/create" element={
        <ProtectedRoute adminOnly>
          <CreateUser />
        </ProtectedRoute>
      } />
      <Route path="/admin/user/:userId" element={
        <ProtectedRoute adminOnly>
          <UserDetails />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={
        <Navigate to={
          isAuthenticated ? 
            (user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard') : 
            '/auth/login'
        } replace />
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
          <AppRoutes />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
