import { useUser } from '@/context/UserContext';

export function useAuth() {

  const { userr, loading, error, logout } = useUser();
  const isAuthenticated = userr !== null;
  const isSystemAdmin = userr?.userRole === 'SystemAdmin';
  const isTenantAdmin = userr?.userRole === 'TenantAdmin';
  const isTenantUser = userr?.userRole === 'TenantUser';

  return {
    userr,
    loading,
    error,
    isAuthenticated,
    isSystemAdmin,
    isTenantAdmin,
    isTenantUser,
    logout,
  };
}