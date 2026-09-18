import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LeaveRequestPage } from './pages/LeaveRequestPage';
import { ResignationPage } from './pages/ResignationPage';
import { EmployeePortalPage } from './pages/EmployeePortalPage';
import { PointsManagementPage } from './pages/PointsManagementPage';
import { AssetsManagementPage } from './pages/AssetsManagementPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ApprovalsHubPage } from './pages/ApprovalsHubPage';
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute';
import { EmployeeProtectedRoute } from './components/auth/EmployeeProtectedRoute';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* المسارات العامة المتاحة للجميع */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/leave-request" element={<LeaveRequestPage />} />
            <Route path="/resignation" element={<ResignationPage />} />
            <Route path="/login" element={<AdminLoginPage />} />

            {/* مسار بوابة الموظف الميداني المحمي بالـ PIN */}
            <Route
              path="/portal"
              element={
                <EmployeeProtectedRoute>
                  <EmployeePortalPage />
                </EmployeeProtectedRoute>
              }
            />

            {/* المسارات الإدارية المحمية بنظام الصلاحيات RBAC */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboardPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/approvals"
              element={
                <AdminProtectedRoute>
                  <ApprovalsHubPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/points"
              element={
                <AdminProtectedRoute>
                  <PointsManagementPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/assets"
              element={
                <AdminProtectedRoute>
                  <AssetsManagementPage />
                </AdminProtectedRoute>
              }
            />

            {/* إعادة توجيه أي مسار غير معروف للرئيسية */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
