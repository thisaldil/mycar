import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullScreenLoader } from './FullScreenLoader';

/** Auth screens redirect signed-in users back into the app. */
export function PublicRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'authenticated') {
    const from = location.state?.from;
    const to = from ? `${from.pathname}${from.search || ''}` : '/dashboard';
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}