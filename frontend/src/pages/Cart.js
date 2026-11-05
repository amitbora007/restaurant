import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useCart } from '../App';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalAmount } = useCart();
  const navigate = useNavigate();

  const subtotal = getTotalAmount();
  const gst = Number((subtotal * 0.05).toFixed(2));
  const isFreeDelivery = subtotal >= 500;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const grandTotal = Number((subtotal + gst + deliveryFee).toFixed(2));

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-[65vh] flex flex-col items-center justify-center py-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md bg-card/60 border border-border/80 p-8 sm:p-12 rounded-xl backdrop-blur-md"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-6">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-foreground" data-testid="empty-cart-heading">
              Your Bag is Empty
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Explore our artisanal Indian, Chinese, and Continental culinary repertoire and add your favorite dishes.
            </p>
            <Link to="/menu">
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide shadow-md"
                data-testid="browse-menu-btn"
              >
                Explore Menu
              </Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 md:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <span className="text-xs font-semibold tracking-widest text-primary uppercase block mb-1">
            Review Selection
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold" data-testid="cart-heading">
            Your Order Bag
          </h1>
        </motion.div>

        {/* Free Delivery Banner */}
        <div className="mb-8 p-3.5 rounded-lg bg-card border border-primary/30 flex items-center gap-3 text-sm">
          <Truck className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            {isFreeDelivery ? (
              <span className="text-emerald-400 font-medium">
                You've unlocked <strong>Complimentary Delivery</strong> on this order!
              </span>
            ) : (
              <span className="text-muted-foreground">
                Add <strong className="text-primary">₹{(500 - subtotal).toFixed(2)}</strong> more to enjoy complimentary delivery.
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={`${item.menu_item_id}-${item.size}`}
                className="bg-card border border-border/80 rounded-lg p-4 sm:p-5 flex gap-4 items-center justify-between hover:border-border transition-colors"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                data-testid={`cart-item-${item.menu_item_id}`}
              >
                {/* Thumbnail */}
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-border/60 flex-shrink-0"
                    loading="lazy"
                  />
                )}

                {/* Details */}
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-foreground truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 mb-2">
                    <span className="capitalize px-1.5 py-0.5 rounded bg-secondary text-foreground font-medium">
                      {item.size}
                    </span>
                    <span>&bull;</span>
                    <span className="text-primary font-semibold">₹{item.price} each</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="inline-flex items-center bg-secondary/80 border border-border/80 rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menu_item_id, item.size, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      aria-label="Decrease quantity"
                      data-testid={`decrease-qty-btn-${item.menu_item_id}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span
                      className="w-7 text-center text-xs font-bold text-foreground"
                      data-testid={`item-quantity-${item.menu_item_id}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menu_item_id, item.size, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      aria-label="Increase quantity"
                      data-testid={`increase-qty-btn-${item.menu_item_id}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="text-right flex flex-col items-end justify-between h-full gap-3">
                  <span className="text-base sm:text-lg font-serif font-bold text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.menu_item_id, item.size)}
                    className="text-muted-foreground/60 hover:text-destructive p-1 rounded transition-colors"
                    aria-label={`Remove ${item.name} from bag`}
                    data-testid={`remove-item-btn-${item.menu_item_id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bill Summary Sidebar */}
          <div className="lg:col-span-5 bg-card border border-border/80 rounded-xl p-6 sm:p-8 space-y-6 sticky top-24">
            <h2 className="text-xl font-serif font-bold text-foreground pb-4 border-b border-border/60">
              Bill Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="text-foreground font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Restaurant GST (5%)</span>
                <span className="text-foreground font-medium">₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Partner Fee</span>
                {isFreeDelivery ? (
                  <span className="text-emerald-400 font-semibold uppercase text-xs tracking-wider">Free</span>
                ) : (
                  <span className="text-foreground font-medium">₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border/80 flex justify-between items-baseline">
              <span className="text-base font-bold text-foreground">Grand Total</span>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-primary" data-testid="total-amount">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <Button
              size="lg"
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-medium tracking-wide shadow-md active:scale-95 transition-transform"
              data-testid="proceed-checkout-btn"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>100% Secure Checkout &bull; Verified Kitchen Hygiene</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;