import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  message?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, message }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return (
      <>
        {/* Render the protected content in the background, but blur it and disable interactions */}
        <div className="pointer-events-none blur-md opacity-30 select-none w-full min-h-screen">
          {children}
        </div>
        {/* Render the AuthPage as a fixed modal over it */}
        <div className="fixed inset-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md overflow-y-auto pt-[80px]">
          <AuthPage />
        </div>
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
