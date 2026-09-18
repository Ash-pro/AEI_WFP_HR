import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { storageService } from '../../lib/storageService';
import { AdminRole } from '../../lib/types';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AdminRole[];
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const location = useLocation();
  const session = storageService.getCurrentAdminSession();

  // إذا لم يكن مسجل دخوله كإداري
  if (!session || !session.user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // إذا تم تحديد أدوار معينة
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(session.user.role)) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};
