import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Menus from './pages/Menus';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import AccessDenied from './pages/AccessDenied';
import CmsModuleView from './pages/CmsModuleView';
import BlogManager from './pages/BlogManager';
import PostEditor from './pages/PostEditor';
import CategoryManager from './pages/CategoryManager';
import MediaLibrary from './pages/MediaLibrary';
import BlogAnalytics from './pages/BlogAnalytics';
import CookieConsentManager from './pages/CookieConsentManager';
import WebsiteThemeManager from './pages/WebsiteThemeManager';
import SubscribersManager from './pages/SubscribersManager';
import LeadsManager from './pages/LeadsManager';
import LandingPageBuilder from './pages/LandingPageBuilder';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />

          {/* Protected Admin Console Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute requiredPermission="dashboard.read">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredPermission="users.read">
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="roles"
              element={
                <ProtectedRoute requiredPermission="roles.read">
                  <Roles />
                </ProtectedRoute>
              }
            />
            <Route
              path="permissions"
              element={
                <ProtectedRoute requiredPermission="permissions.read">
                  <Permissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="menus"
              element={
                <ProtectedRoute requiredPermission="menus.read">
                  <Menus />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute requiredPermission="audit.read">
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute requiredPermission="settings.read">
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* CMS Real Management Modules */}
            <Route
              path="landing-page"
              element={
                <ProtectedRoute requiredPermission="landing_page.read">
                  <LandingPageBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="blog-manager"
              element={
                <ProtectedRoute requiredPermission="posts.read">
                  <BlogManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="create"
              element={
                <ProtectedRoute requiredPermission="posts.create">
                  <PostEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectedRoute requiredPermission="posts.update">
                  <PostEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="blog/categories"
              element={
                <ProtectedRoute requiredPermission="categories.read">
                  <CategoryManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="media"
              element={
                <ProtectedRoute requiredPermission="media.read">
                  <MediaLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="blog/analytics"
              element={
                <ProtectedRoute requiredPermission="analytics.read">
                  <BlogAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="blog/seo"
              element={
                <ProtectedRoute requiredPermission="seo.read">
                  <CmsModuleView
                    moduleTitle="SEO Growth Intelligence"
                    description="Identify keyword cannibalization and high-opportunity topics."
                    requiredPermission="seo.read"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="cookies"
              element={
                <ProtectedRoute requiredPermission="cookies.read">
                  <CookieConsentManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="website-theme"
              element={
                <ProtectedRoute requiredPermission="settings.read">
                  <WebsiteThemeManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="subscribers"
              element={
                <ProtectedRoute requiredPermission="subscribers.read">
                  <SubscribersManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="leads"
              element={
                <ProtectedRoute requiredPermission="leads.read">
                  <LeadsManager />
                </ProtectedRoute>
              }
            />

            <Route path="403" element={<AccessDenied />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
