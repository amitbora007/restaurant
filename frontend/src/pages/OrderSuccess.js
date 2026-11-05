import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CheckCircle2, Clock, MapPin, Phone, ArrowLeft, Utensils, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API}/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order receipt:', err);
        setError('Order could not be found or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Generating your receipt...</p>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Order Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-md mb-6">{error}</p>
          <Link to="/menu">
            <Button className="bg-primary text-primary-foreground">Return to Menu</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const steps = [
    { label: 'Order Received', done: true },
    { label: 'Kitchen Preparing', done: ['preparing', 'out_for_delivery', 'completed'].includes(order.status) },
    { label: order.fulfillment_type === 'delivery' ? 'Out for Delivery' : 'Ready to Serve', done: ['out_for_delivery', 'completed'].includes(order.status) },
    { label: 'Enjoy Meal', done: order.status === 'completed' },
  ];

  return (
    <Layout>
      <div className="py-12 md:py-20 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <span className="text-xs uppercase tracking-widest text-primary font-semibold block mb-1">
            Order Confirmed &bull; Preparing Fresh
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            Thank you, {order.customer_name}!
          </h1>
          <p className="text-muted-foreground text-sm">
            Order Reference: <strong className="text-foreground font-mono">{order.id.slice(0, 8).toUpperCase()}</strong>
          </p>
        </motion.div>

        {/* Live Progress Bar */}
        <div className="bg-card border border-border/80 rounded-xl p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              <span>Estimated Time: <strong>30–45 mins</strong></span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-primary/10 text-primary border border-primary/20">
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-colors ${
                    step.done
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`text-xs ${step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-card border border-border/80 rounded-xl p-6 sm:p-8 space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-border/60 gap-2">
            <h2 className="text-lg font-serif font-bold">Fulfillment Details</h2>
            <span className="text-xs font-medium uppercase tracking-wider text-primary capitalize">
              {order.fulfillment_type.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs block mb-1">Customer Contact</span>
              <p className="font-medium text-foreground">{order.customer_name}</p>
              <p className="text-muted-foreground text-xs">{order.customer_email}</p>
              <p className="text-muted-foreground text-xs">{order.customer_phone}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-xs block mb-1">Delivery / Dining Location</span>
              {order.fulfillment_type === 'delivery' && (
                <p className="text-foreground text-xs leading-relaxed">
                  {order.delivery_address || 'Address provided at checkout'}
                </p>
              )}
              {order.fulfillment_type === 'dine_in' && (
                <p className="text-foreground text-sm font-semibold">
                  Table Number: {order.table_number || 'General Dining Hall'}
                </p>
              )}
              {order.fulfillment_type === 'takeaway' && (
                <p className="text-foreground text-sm">
                  Pickup Counter &bull; Restaurant Main Desk
                </p>
              )}
              {order.notes && (
                <p className="text-muted-foreground text-xs italic mt-2">
                  Special Notes: "{order.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Itemized Receipt Table */}
          <div className="pt-4 border-t border-border/60">
            <h3 className="text-sm font-semibold mb-3">Ordered Items</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">({item.size})</span>
                    <span className="text-xs text-muted-foreground">&times; {item.quantity}</span>
                  </div>
                  <span className="font-medium text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 mt-4 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{(order.subtotal || order.total_amount * 0.95).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Restaurant GST (5%)</span>
                <span>₹{(order.gst_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{order.delivery_fee ? `₹${order.delivery_fee.toFixed(2)}` : 'Complimentary'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/60 text-base font-bold text-foreground">
                <span>Total Paid</span>
                <span className="text-primary font-serif">₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/menu" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <ArrowLeft className="h-4 w-4" /> Order More Dishes
            </Button>
          </Link>
          <a href="tel:+919876543210" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto text-muted-foreground hover:text-foreground gap-2">
              <Phone className="h-4 w-4 text-primary" /> Questions? Call Kitchen
            </Button>
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
