import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Truck, Store, UtensilsCrossed } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useCart } from '../App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, getTotalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState('delivery'); // 'delivery', 'takeaway', 'dine_in'
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    table_number: '',
    notes: '',
  });

  const subtotal = getTotalAmount();
  const gst = Number((subtotal * 0.05).toFixed(2));
  const isFreeDelivery = fulfillmentType !== 'delivery' || subtotal >= 500;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const grandTotal = Number((subtotal + gst + deliveryFee).toFixed(2));

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Phone validation
    const cleanPhone = formData.customer_phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (fulfillmentType === 'delivery' && !formData.delivery_address.trim()) {
      toast.error('Please enter complete delivery address');
      return;
    }

    if (fulfillmentType === 'dine_in' && !formData.table_number.trim()) {
      toast.error('Please specify your table number');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: cleanPhone,
        fulfillment_type: fulfillmentType,
        delivery_address: fulfillmentType === 'delivery' ? formData.delivery_address : null,
        table_number: fulfillmentType === 'dine_in' ? formData.table_number : null,
        notes: formData.notes,
        items: cartItems,
      };

      const response = await axios.post(`${API}/orders`, orderData);
      const order = response.data;

      // Demo mode / direct paid without Razorpay
      if (!order.razorpay_order_id) {
        clearCart();
        toast.success('Order confirmed successfully!');
        navigate(`/order-success/${order.id}`);
        return;
      }

      // Live Razorpay payment gateway
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        toast.error('Failed to load Razorpay payment gateway');
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: Math.round(order.total_amount * 100),
        currency: 'INR',
        name: 'Food Hub',
        description: 'Artisanal Restaurant Order Payment',
        order_id: order.razorpay_order_id,
        handler: async (razorpayResponse) => {
          try {
            await axios.post(`${API}/verify-payment`, {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              order_id: order.id,
            });
            clearCart();
            toast.success('Payment verified! Order placed.');
            navigate(`/order-success/${order.id}`);
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: formData.customer_name,
          email: formData.customer_email,
          contact: formData.customer_phone,
        },
        theme: {
          color: '#dfb128',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error('Payment failed. Please try again or contact staff.');
        console.error('Payment failed:', response.error);
      });
      rzp.open();
    } catch (error) {
      console.error('Order creation error:', error);
      const msg = error?.response?.data?.detail || 'Failed to place order. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <Layout>
      <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <span className="text-xs font-semibold tracking-widest text-primary uppercase block mb-1">
            Secure Order Completion
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground" data-testid="checkout-heading">
            Checkout & Confirmation
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Form Col */}
          <div className="lg:col-span-7">
            {/* Fulfillment Type Selector */}
            <div className="bg-card border border-border/80 rounded-xl p-5 mb-6">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground block mb-3 font-semibold">
                Select Fulfillment Method
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-3 rounded-lg border text-xs sm:text-sm font-medium flex flex-col items-center gap-1.5 transition-all ${
                    fulfillmentType === 'delivery'
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                      : 'border-border/60 text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid="fulfillment-delivery-btn"
                >
                  <Truck className="h-4 w-4" />
                  <span>Home Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentType('dine_in')}
                  className={`p-3 rounded-lg border text-xs sm:text-sm font-medium flex flex-col items-center gap-1.5 transition-all ${
                    fulfillmentType === 'dine_in'
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                      : 'border-border/60 text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid="fulfillment-dinein-btn"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Dine-In Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentType('takeaway')}
                  className={`p-3 rounded-lg border text-xs sm:text-sm font-medium flex flex-col items-center gap-1.5 transition-all ${
                    fulfillmentType === 'takeaway'
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                      : 'border-border/60 text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid="fulfillment-takeaway-btn"
                >
                  <Store className="h-4 w-4" />
                  <span>Takeaway</span>
                </button>
              </div>
            </div>

            {/* Customer Details Form */}
            <form onSubmit={handleSubmit} className="bg-card border border-border/80 rounded-xl p-6 sm:p-8 space-y-5">
              <h2 className="text-lg font-serif font-bold text-foreground pb-2 border-b border-border/60">
                Customer Information
              </h2>

              <div>
                <Label htmlFor="customer_name" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="mt-1.5 bg-background border-border/80"
                  data-testid="customer-name-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_email" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background border-border/80"
                    data-testid="customer-email-input"
                  />
                </div>

                <div>
                  <Label htmlFor="customer_phone" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Mobile Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer_phone"
                    name="customer_phone"
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background border-border/80"
                    data-testid="customer-phone-input"
                  />
                </div>
              </div>

              {/* Conditional Delivery Address */}
              {fulfillmentType === 'delivery' && (
                <div className="animate-in fade-in duration-200">
                  <Label htmlFor="delivery_address" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Delivery Address (House/Flat, Street, Landmark) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="delivery_address"
                    name="delivery_address"
                    type="text"
                    required
                    placeholder="e.g. Flat 302, Palm Heights, Badarpur Extn."
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background border-border/80"
                    data-testid="delivery-address-input"
                  />
                </div>
              )}

              {/* Conditional Dine-In Table */}
              {fulfillmentType === 'dine_in' && (
                <div className="animate-in fade-in duration-200">
                  <Label htmlFor="table_number" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Table Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="table_number"
                    name="table_number"
                    type="text"
                    required
                    placeholder="e.g. Table 7"
                    value={formData.table_number}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background border-border/80"
                    data-testid="table-number-input"
                  />
                </div>
              )}

              {/* Special Cooking Notes */}
              <div>
                <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Special Cooking or Delivery Instructions (Optional)
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  type="text"
                  placeholder="e.g. Less spicy, extra green chutney, no cutlery"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1.5 bg-background border-border/80"
                  data-testid="order-notes-input"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-medium tracking-wide shadow-lg active:scale-95 transition-transform"
                data-testid="place-order-btn"
              >
                {loading ? 'Processing Order...' : `Authorize & Pay ₹${grandTotal.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary Col */}
          <div className="lg:col-span-5 bg-card border border-border/80 rounded-xl p-6 sm:p-8 space-y-6 sticky top-24">
            <h2 className="text-lg font-serif font-bold text-foreground pb-4 border-b border-border/60">
              Order Summary ({cartItems.reduce((s, i) => s + i.quantity, 0)} Items)
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {cartItems.map((item) => (
                <div
                  key={`${item.menu_item_id}-${item.size}`}
                  className="flex justify-between items-center text-sm"
                  data-testid={`summary-item-${item.menu_item_id}`}
                >
                  <div className="pr-2">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground block">
                      Size: {item.size} &bull; Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-medium text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Restaurant GST (5%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'Complimentary' : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/60 text-base font-bold text-foreground">
                <span>Grand Total</span>
                <span className="text-primary font-serif text-xl" data-testid="summary-total">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 pt-2 border-t border-border/60">
              <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Payments secured by 256-bit encryption &bull; Direct kitchen dispatch</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;