import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
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
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...formData,
        items: cartItems,
        total_amount: getTotalAmount(),
      };

      const response = await axios.post(`${API}/orders`, orderData);
      const order = response.data;

      if (!order.razorpay_order_id) {
        clearCart();
        toast.success('Order placed successfully! (Demo mode - No payment gateway configured)');
        navigate('/menu');
        return;
      }

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.total_amount * 100,
        currency: 'INR',
        name: 'The Flavour Junction',
        description: 'Order Payment',
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
            toast.success('Payment successful! Order placed.');
            navigate('/menu');
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
          color: '#C8A870',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error('Payment failed. Please try again.');
        console.error('Payment failed:', response.error);
      });
      rzp.open();
    } catch (error) {
      console.error('Order creation error:', error);
      const msg = error?.response?.data?.detail || 'Failed to create order. Please try again.';
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
      <div className="py-24 max-w-4xl mx-auto px-6 md:px-12">
        <motion.h1
          className="text-5xl font-bold mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          data-testid="checkout-heading"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl md:text-2xl font-bold mb-6">Customer Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <Label htmlFor="customer_name">Full Name</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="mt-2"
                  data-testid="customer-name-input"
                />
              </div>
              <div>
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  required
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  className="mt-2"
                  data-testid="customer-email-input"
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Phone Number</Label>
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  type="tel"
                  required
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  className="mt-2"
                  data-testid="customer-phone-input"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                data-testid="place-order-btn"
              >
                {loading ? 'Processing...' : `Pay ₹${getTotalAmount().toFixed(2)}`}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl md:text-2xl font-bold mb-6">Order Summary</h2>
            <div className="bg-card border border-border p-4 md:p-6 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.menu_item_id}-${item.size}`}
                  className="flex justify-between text-sm"
                  data-testid={`summary-item-${item.menu_item_id}`}
                >
                  <span className="text-muted-foreground">
                    {item.name} ({item.size}) x {item.quantity}
                  </span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary" data-testid="summary-total">
                    ₹{getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;