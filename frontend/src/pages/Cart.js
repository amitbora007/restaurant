import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/App';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalAmount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6" data-testid="empty-cart-heading">
              Your Cart is Empty
            </h2>
            <p className="text-muted-foreground mb-8">Start adding delicious items to your cart!</p>
            <Link to="/menu">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="browse-menu-btn"
              >
                Browse Menu
              </Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 md:py-24 max-w-5xl mx-auto px-4 md:px-6 lg:px-12">
        <motion.h1
          className="text-3xl md:text-5xl font-bold mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          data-testid="cart-heading"
        >
          Your Cart
        </motion.h1>

        <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
          {cartItems.map((item, index) => (
            <motion.div
              key={`${item.menu_item_id}-${item.size}`}
              className="bg-card border border-border p-4 md:p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-testid={`cart-item-${item.menu_item_id}`}
            >
              <div className="flex gap-3 md:gap-6">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover border border-border flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-lg md:text-xl font-bold">{item.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.menu_item_id, item.size)}
                      className="hover:text-destructive flex-shrink-0"
                      data-testid={`remove-item-btn-${item.menu_item_id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
                    Size: <span className="capitalize">{item.size}</span>
                  </p>
                  <p className="text-primary font-semibold text-base md:text-lg mb-3">₹{item.price}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3 border border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:h-10 md:w-10"
                        onClick={() =>
                          updateQuantity(item.menu_item_id, item.size, item.quantity - 1)
                        }
                        data-testid={`decrease-qty-btn-${item.menu_item_id}`}
                      >
                        <Minus className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <span
                        className="w-8 md:w-12 text-center font-medium"
                        data-testid={`item-quantity-${item.menu_item_id}`}
                      >
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:h-10 md:w-10"
                        onClick={() =>
                          updateQuantity(item.menu_item_id, item.size, item.quantity + 1)
                        }
                        data-testid={`increase-qty-btn-${item.menu_item_id}`}
                      >
                        <Plus className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                    <p className="text-base md:text-lg font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-card border border-border p-4 md:p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <span className="text-lg md:text-2xl font-bold">Total Amount:</span>
            <span className="text-xl md:text-3xl font-bold text-primary" data-testid="total-amount">
              ₹{getTotalAmount().toFixed(2)}
            </span>
          </div>
          <Button
            size="lg"
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300"
            data-testid="proceed-checkout-btn"
          >
            Proceed to Checkout
            <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Cart;