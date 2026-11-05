import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, List, ShoppingBag, LogOut, Menu, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { useAuth } from '../App';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/menu-items', icon: Package, label: 'Menu Items' },
    { path: '/admin/categories', icon: List, label: 'Categories' },
  ];

  const currentNav = navItems.find((n) => n.path === location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open management menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg text-primary">FH Admin</span>
            {currentNav && (
              <span className="text-xs text-muted-foreground font-medium border-l border-border pl-2">
                {currentNav.label}
              </span>
            )}
          </div>
        </div>
        <Link to="/" target="_blank" rel="noreferrer">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 px-2">
            Store <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </header>

      {/* Mobile Drawer (Slide-over) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer Body */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-72 max-w-[80vw] bg-card border-r border-border p-6 flex flex-col z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
                <div>
                  <h2 className="text-xl font-serif font-bold text-primary">Food Hub</h2>
                  <p className="text-xs text-muted-foreground">Admin Portal</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                    >
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={`w-full justify-start gap-3 ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-border/60 space-y-2">
                <Link to="/" target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full justify-start gap-3 text-xs mb-2 text-foreground hover:bg-secondary hover:border-primary/50">
                    <ExternalLink className="h-4 w-4" /> View Live Restaurant
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border/80 p-6 flex-col justify-between sticky top-0 h-screen flex-shrink-0">
        <div>
          <div className="mb-8 pb-6 border-b border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-serif font-bold text-foreground">FH Admin</h1>
            </div>
            <p className="text-xs text-muted-foreground tracking-wide">
              Kitchen & Menu Operations
            </p>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-3 text-sm ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-border/60 space-y-2">
          <Link to="/" target="_blank" rel="noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Public Site
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            data-testid="logout-btn"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="flex-1 p-4 sm:p-8 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;