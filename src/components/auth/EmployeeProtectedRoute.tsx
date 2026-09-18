import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { storageService } from '../../lib/storageService';

interface EmployeeProtectedRouteProps {
  children: React.ReactNode;
}

export const EmployeeProtectedRoute: React.FC<EmployeeProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const session = storageService.getCurrentSession();

  // إذا لم يكن الموظف مسجلاً دخوله برمز المرور (PIN)
  if (!session) {
    return <Navigate to="/" state={{ openPinModal: true, from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
