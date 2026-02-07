import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

export function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAdmin } = useAuth();

  return (
    <ProtectedRoute>
      {isAdmin ? children : <Navigate to="/account" replace />}
    </ProtectedRoute>
  );
}
