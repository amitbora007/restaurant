import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Truck, Store, UtensilsCrossed, AlertCircle, ShoppingBag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useCart } from '../App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const CheckoutModal = ({ open, onOpenChange }) => {
  const { cartItems, getTotalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState('delivery'); // 'delivery', 'dine_in', 'takeaway'
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const cleanPhone = formData.customer_phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
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

      // Demo mode / direct paid without Razorpay credentials
      if (!order.razorpay_order_id) {
        clearCart();
        if (onOpenChange) onOpenChange(false);
        toast.success('Order confirmed successfully!');
        navigate(`/order-success/${order.id}`);
        return;
      }

      // Live Razorpay payment gateway
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        toast.error('Failed to load Razorpay payment gateway');
        setLoading(false);
        return;
      }

      // Close the Radix dialog first so it un-traps focus and releases pointer-events on document.body,
      // allowing Razorpay's checkout iframe to mount and interact seamlessly on the page.
      if (onOpenChange) onOpenChange(false);

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
            if (onOpenChange) onOpenChange(true);
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
        redirect: false,
        modal: {
          ondismiss: () => {
            setLoading(false);
            if (onOpenChange) onOpenChange(true);
            toast.info('Payment window closed. Your cart and details are preserved.');
          },
          escape: true,
          backdropclose: false,
          animation: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (failRes) => {
        setLoading(false);
        if (onOpenChange) onOpenChange(true);
        toast.error('Payment failed. Please try again or contact staff.');
        console.error('Payment failed:', failRes.error);
      });
      rzp.open();
    } catch (error) {
      console.error('Order creation error:', error);
      const msg = error?.response?.data?.detail || 'Failed to place order. Please try again.';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden max-h-[92vh] flex flex-col bg-card border-border/80 text-foreground shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 border-b border-border/80 bg-background/50 backdrop-blur-sm text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold tracking-widest text-primary uppercase font-sans">
              Artisanal Dining Experience
            </span>
            <span className="text-muted-foreground/40 text-xs">&bull;</span>
            <span className="text-[11px] text-muted-foreground font-medium">Instant Confirmation</span>
          </div>
          <DialogTitle
            className="text-2xl sm:text-3xl font-serif font-bold text-foreground"
            data-testid="checkout-heading"
          >
            Checkout & Order Confirmation
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Complete diner details below to authorize kitchen dispatch.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 pr-3 sm:pr-5">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground text-sm">Your dining cart is empty.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="border-border/80"
              >
                Return to Menu
              </Button>
            </div>
          ) : (
            <form id="checkout-modal-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Fulfillment Method Selector */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground block mb-2.5 font-semibold">
                  Fulfillment Method
                </Label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex flex-col items-center gap-1.5 transition-all ${
                      fulfillmentType === 'delivery'
                        ? 'bg-primary/15 border-primary text-primary font-bold shadow-sm'
                        : 'border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                    }`}
                    data-testid="fulfillment-delivery-btn"
                  >
                    <Truck className="h-4 w-4" />
                    <span>Home Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('dine_in')}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex flex-col items-center gap-1.5 transition-all ${
                      fulfillmentType === 'dine_in'
                        ? 'bg-primary/15 border-primary text-primary font-bold shadow-sm'
                        : 'border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                    }`}
                    data-testid="fulfillment-dinein-btn"
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    <span>Dine-In Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('takeaway')}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex flex-col items-center gap-1.5 transition-all ${
                      fulfillmentType === 'takeaway'
                        ? 'bg-primary/15 border-primary text-primary font-bold shadow-sm'
                        : 'border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                    }`}
                    data-testid="fulfillment-takeaway-btn"
                  >
                    <Store className="h-4 w-4" />
                    <span>Takeaway</span>
                  </button>
                </div>
              </div>

              {/* Customer Information Inputs */}
              <div className="space-y-4 pt-1">
                <div className="border-b border-border/60 pb-1">
                  <h3 className="text-sm font-serif font-bold text-foreground">
                    Diner Details
                  </h3>
                </div>

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
                    className="mt-1.5 bg-background/80 border-border/80"
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
                      className="mt-1.5 bg-background/80 border-border/80"
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
                      className="mt-1.5 bg-background/80 border-border/80"
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
                      className="mt-1.5 bg-background/80 border-border/80"
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
                      className="mt-1.5 bg-background/80 border-border/80"
                      data-testid="table-number-input"
                    />
                  </div>
                )}

                {/* Special Cooking Notes */}
                <div>
                  <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Chef & Delivery Instructions (Optional)
                  </Label>
                  <Input
                    id="notes"
                    name="notes"
                    type="text"
                    placeholder="e.g. Medium spice, extra mint dip, call on arrival"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background/80 border-border/80"
                    data-testid="order-notes-input"
                  />
                </div>
              </div>

              {/* Order Review & Bill Summary inside Modal */}
              <div className="bg-background/60 border border-border/80 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Order Summary ({cartItems.reduce((s, i) => s + i.quantity, 0)} Items)
                  </span>
                  <span className="text-xs text-primary font-medium">Verified Chef Hygiene</span>
                </div>

                <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1 text-sm no-scrollbar">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.menu_item_id}-${item.size}`}
                      className="flex justify-between items-center text-xs sm:text-sm"
                      data-testid={`summary-item-${item.menu_item_id}`}
                    >
                      <div className="pr-2">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-[11px] text-muted-foreground block">
                          Size: {item.size} &bull; Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-foreground font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restaurant GST (5%)</span>
                    <span className="text-foreground font-medium">₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Partner Fee</span>
                    <span className="text-foreground font-medium">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-semibold uppercase text-[11px] tracking-wider">
                          Complimentary
                        </span>
                      ) : (
                        `₹${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sticky Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-border/80 bg-background/80 backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block">
                Total Payable Amount
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-primary" data-testid="summary-total">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-border/80 hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
              >
                Back to Cart
              </Button>
              <Button
                type="submit"
                form="checkout-modal-form"
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 font-medium shadow-lg active:scale-95 transition-transform"
                data-testid="place-order-btn"
              >
                {loading ? 'Processing...' : `Authorize & Pay ₹${grandTotal.toFixed(2)}`}
              </Button>
            </div>
          </div>
        )}

        <div className="px-5 py-2.5 bg-secondary/30 border-t border-border/40 flex items-center justify-center gap-2 text-[11px] text-muted-foreground/80">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>256-Bit Encrypted &bull; Direct Kitchen Queue &bull; Contactless Dispatch</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
