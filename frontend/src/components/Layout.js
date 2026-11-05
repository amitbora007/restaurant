import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, X, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../App';
import { Button } from './ui/button';

export const Layout = ({ children }) => {
  const { cartItems } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Cart', path: '/cart' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Sticky Header */}
      <motion.header
        className="sticky top-0 z-50 backdrop-blur-xl bg-background/85 border-b border-border/60 transition-colors"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between" aria-label="Main Navigation">
          {/* Logo with Luxury Emblem */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            data-testid="logo-link"
          >
            <div className="w-10 h-10 rounded-lg bg-card border border-primary/30 flex items-center justify-center p-2 text-primary shadow-sm group-hover:border-primary transition-colors">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="6">
                <circle cx="50" cy="50" r="42" strokeDasharray="6 3" strokeWidth="4" opacity="0.6"/>
                <path d="M28 52 C28 36 72 36 72 52 Z" strokeWidth="6" strokeLinecap="round" />
                <circle cx="50" cy="32" r="5" fill="currentColor" stroke="none" />
                <line x1="22" y1="58" x2="78" y2="58" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors font-serif block leading-none">
                Food Hub
              </span>
              <span className="text-[11px] tracking-[0.2em] text-primary uppercase font-sans font-medium">
                Artisanal Cuisine
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/menu' ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid="menu-nav-link"
            >
              Menu
            </Link>
            <Link to="/cart" className="relative" aria-label={`Shopping cart with ${cartCount} items`}>
              <Button
                variant="outline"
                size="sm"
                className="border-border/80 hover:border-primary text-foreground hover:text-primary hover:bg-primary/10 gap-2 px-3 py-2"
                data-testid="cart-icon-button"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span
                    className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold leading-none animate-in zoom-in"
                    data-testid="cart-badge"
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/cart" className="relative" aria-label={`Cart with ${cartCount} items`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary hover:bg-primary/10"
                data-testid="mobile-cart-btn"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[11px] leading-none flex items-center justify-center font-bold"
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="text-foreground"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-b border-border bg-card/95 backdrop-blur-xl px-6 py-4 space-y-3"
            >
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-base font-medium transition-colors ${
                    location.pathname === item.path ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 border-t border-border">
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" /> Admin Portal
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Sophisticated Luxury Footer */}
      <footer className="bg-card border-t border-border/80 pt-16 pb-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-border/60">
            {/* Col 1: Brand Ethos */}
            <div className="md:col-span-1">
              <span className="text-3xl font-serif font-bold text-primary tracking-tight block mb-2">
                Food Hub
              </span>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Curating culinary excellence across Indian, Chinese, and Continental traditions. Prepared with authentic spices, premium ingredients, and unmatched passion.
              </p>
              <div className="flex items-center gap-2 text-xs text-primary font-medium tracking-wide">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                Kitchen Open for Dine-in & Delivery
              </div>
            </div>

            {/* Col 2: Operating Hours */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Hours of Operation
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <span className="text-foreground font-medium">Lunch:</span> 12:00 PM – 4:00 PM
                </li>
                <li>
                  <span className="text-foreground font-medium">Dinner:</span> 7:00 PM – 11:30 PM
                </li>
                <li className="text-xs text-primary/90 pt-1">
                  Open all 7 days a week
                </li>
              </ul>
            </div>

            {/* Col 3: Contact & Address */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Visit Us
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Badarpur Border, New Delhi - 110044
              </p>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+919876543210" className="hover:text-primary transition-colors">
                  +91 8527520048
                </a>
              </div>
            </div>

            {/* Col 4: Quick Navigation */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
                Explore
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/menu" className="text-muted-foreground hover:text-primary transition-colors">
                    Artisanal Menu
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">
                    Order Bag
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Staff Access
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Food Hub. All rights reserved.</p>
            <p className="text-muted-foreground">
              Designed with timeless craftsmanship & modern culinary intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;