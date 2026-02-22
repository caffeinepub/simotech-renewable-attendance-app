import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
import { useIsAdmin } from './hooks/useIsAdmin';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MonthlyReportPage from './pages/MonthlyReportPage';
import AccessDeniedScreen from './components/AccessDeniedScreen';
import OfflineIndicator from './components/OfflineIndicator';
import { useEffect } from 'react';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <OfflineIndicator />
    </>
  ),
});

// Index route - redirects based on auth and role
function IndexPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[IndexPage] Route state:', {
      hasIdentity: !!identity,
      principal: identity?.getPrincipal().toString(),
      isAdmin,
      isAdminLoading,
    });

    if (!identity) return;
    if (isAdminLoading) return;
    
    if (isAdmin) {
      console.log('[IndexPage] Redirecting to admin dashboard');
      navigate({ to: '/admin' });
    } else {
      console.log('[IndexPage] Redirecting to employee dashboard');
      navigate({ to: '/dashboard' });
    }
  }, [identity, isAdmin, isAdminLoading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome to Simotech Renewable</h1>
        <p className="text-lg text-muted-foreground">Please log in to access the attendance system</p>
      </div>
    </div>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
});

// Employee dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: EmployeeDashboard,
});

// Admin dashboard route
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

// Monthly report route
const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: MonthlyReportPage,
});

// Access denied route
const accessDeniedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/access-denied',
  component: AccessDeniedScreen,
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  adminRoute,
  reportsRoute,
  accessDeniedRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}
