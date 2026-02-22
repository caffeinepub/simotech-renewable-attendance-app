import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useIsAdmin';
import LoginButton from './LoginButton';
import { Link } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  console.log('[Layout] ===== COMPONENT FUNCTION CALLED =====', {
    timestamp: new Date().toISOString(),
  });

  const { identity, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading, status: adminQueryStatus, fetchStatus: adminFetchStatus } = useIsAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;

  console.log('[Layout] ===== HOOKS STATE =====', {
    timestamp: new Date().toISOString(),
    isAuthenticated,
    loginStatus,
    principal: identity?.getPrincipal().toString(),
    isAdmin,
    isAdminType: typeof isAdmin,
    isAdminValue: isAdmin === true ? 'TRUE' : isAdmin === false ? 'FALSE' : 'UNDEFINED/NULL',
    isAdminLoading,
    adminQueryStatus,
    adminFetchStatus,
  });

  useEffect(() => {
    console.log('[Layout] ===== useEffect: Auth/Admin State Changed =====');
    console.log('[Layout] Timestamp:', new Date().toISOString());
    console.log('[Layout] Authentication state:', {
      isAuthenticated,
      loginStatus,
      principal: identity?.getPrincipal().toString(),
    });
    console.log('[Layout] Admin state:', {
      isAdmin,
      isAdminType: typeof isAdmin,
      isAdminValue: isAdmin === true ? 'TRUE' : isAdmin === false ? 'FALSE' : 'UNDEFINED/NULL',
      isAdminLoading,
      adminQueryStatus,
      adminFetchStatus,
    });
    console.log('[Layout] Navigation rendering logic:', {
      willShowNavigation: isAuthenticated && !isAdminLoading,
      willShowAdminLinks: isAuthenticated && !isAdminLoading && isAdmin === true,
      willShowEmployeeLinks: isAuthenticated && !isAdminLoading && isAdmin === false,
      willHideNavigation: !isAuthenticated || isAdminLoading,
    });
  }, [isAuthenticated, loginStatus, isAdmin, isAdminLoading, adminQueryStatus, adminFetchStatus, identity]);

  console.log('[Layout] ===== NAVIGATION RENDER DECISION =====', {
    timestamp: new Date().toISOString(),
    isAuthenticated,
    isAdminLoading,
    isAdmin,
    willRenderNavigation: isAuthenticated && !isAdminLoading,
    willRenderAdminLinks: isAuthenticated && !isAdminLoading && isAdmin,
    willRenderEmployeeLinks: isAuthenticated && !isAdminLoading && !isAdmin,
  });

  // Log navigation rendering decisions outside JSX
  if (!isAuthenticated) {
    console.log('[Layout] 🔄 Not rendering navigation - not authenticated');
  }
  if (isAdminLoading) {
    console.log('[Layout] 🔄 Not rendering navigation - admin status loading');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/assets/generated/simotech-logo.dim_200x200.png" 
                alt="Simotech logo" 
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {isAuthenticated && !isAdminLoading && (
                <>
                  {isAdmin ? (
                    <>
                      {(() => {
                        console.log('[Layout] 🔄 Rendering ADMIN navigation links (desktop)');
                        return null;
                      })()}
                      <Link 
                        to="/admin" 
                        className="text-foreground hover:text-primary transition-colors font-medium"
                      >
                        Admin Dashboard
                      </Link>
                      <Link 
                        to="/reports" 
                        className="text-foreground hover:text-primary transition-colors font-medium"
                      >
                        Reports
                      </Link>
                    </>
                  ) : (
                    <>
                      {(() => {
                        console.log('[Layout] 🔄 Rendering EMPLOYEE navigation links (desktop)');
                        return null;
                      })()}
                      <Link 
                        to="/dashboard" 
                        className="text-foreground hover:text-primary transition-colors font-medium"
                      >
                        My Dashboard
                      </Link>
                    </>
                  )}
                </>
              )}
              <LoginButton />
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-3 border-t border-border">
              {isAuthenticated && !isAdminLoading && (
                <>
                  {isAdmin ? (
                    <>
                      {(() => {
                        console.log('[Layout] 🔄 Rendering ADMIN navigation links (mobile)');
                        return null;
                      })()}
                      <Link 
                        to="/admin" 
                        className="block text-foreground hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                      <Link 
                        to="/reports" 
                        className="block text-foreground hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Reports
                      </Link>
                    </>
                  ) : (
                    <>
                      {(() => {
                        console.log('[Layout] 🔄 Rendering EMPLOYEE navigation links (mobile)');
                        return null;
                      })()}
                      <Link 
                        to="/dashboard" 
                        className="block text-foreground hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Dashboard
                      </Link>
                    </>
                  )}
                </>
              )}
              <div className="pt-2">
                <LoginButton />
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Simotech Renewable. All rights reserved.</p>
            <p className="mt-2">
              Built with love using{' '}
              <a 
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
