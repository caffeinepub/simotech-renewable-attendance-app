import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useIsAdmin';
import LoginButton from './LoginButton';
import { Link } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    console.log('[Layout] Auth and admin state:', {
      isAuthenticated,
      isAdmin,
      isAdminLoading,
      identity: identity?.getPrincipal().toString(),
    });
  }, [isAuthenticated, isAdmin, isAdminLoading, identity]);

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
                    <Link 
                      to="/dashboard" 
                      className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                      My Dashboard
                    </Link>
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
                    <Link 
                      to="/dashboard" 
                      className="block text-foreground hover:text-primary transition-colors font-medium py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Dashboard
                    </Link>
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
