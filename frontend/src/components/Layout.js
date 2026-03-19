import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/App';
import { Button } from '@/components/ui/button';

export const Layout = ({ children }) => {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <motion.header
        className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl md:text-3xl font-bold text-primary tracking-tight"
            data-testid="logo-link"
          >
            The Flavour Junction
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/menu">
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary hover:bg-primary/10 transition-all"
                data-testid="menu-nav-link"
              >
                Menu
              </Button>
            </Link>
            <Link to="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary hover:bg-primary/10 transition-all"
                data-testid="cart-icon-button"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium"
                    data-testid="cart-badge"
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </nav>
      </motion.header>
      <main className="flex-1">{children}</main>
      <footer className="bg-card border-t border-border py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-6xl font-bold text-primary/20">TFJ</h3>
              <p className="text-muted-foreground mt-4">
                Serving Indian, Chinese & Continental cuisine with love.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/menu"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Menu
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/login"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-muted-foreground">
                B-17, Block-C, 40 Feet Road
                <br />
                Badarpur Extn., New Delhi-110044
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2025 The Flavour Junction. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;