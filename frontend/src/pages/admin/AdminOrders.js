import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, Clock, MapPin, Phone, Mail, CheckCircle, AlertCircle, UtensilsCrossed, Truck } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const AdminOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'cancelled'
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.put(
        `${API}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order #${orderId.slice(0, 6)} updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return ['pending', 'paid', 'preparing', 'out_for_delivery'].includes(o.status);
    if (filter === 'completed') return o.status === 'completed';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground" data-testid="orders-heading">
              Orders Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live kitchen order queue and fulfillment tracking
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: `All (${orders.length})` },
            { id: 'active', label: `Active In Kitchen (${orders.filter(o => ['pending', 'paid', 'preparing', 'out_for_delivery'].includes(o.status)).length})` },
            { id: 'completed', label: `Completed (${orders.filter(o => o.status === 'completed').length})` },
            { id: 'cancelled', label: `Cancelled (${orders.filter(o => o.status === 'cancelled').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order Cards List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border/80 rounded-xl p-5 sm:p-6 transition-colors shadow-sm hover:border-border"
              data-testid={`order-row-${order.id}`}
            >
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-serif font-bold text-lg text-foreground">
                      {order.customer_name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs uppercase font-medium tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      {order.fulfillment_type === 'delivery' ? <Truck className="h-3 w-3" /> : <UtensilsCrossed className="h-3 w-3" />}
                      {order.fulfillment_type?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-primary" /> {order.customer_phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-primary" /> {order.customer_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Status Updater */}
                <div className="flex items-center gap-3">
                  <div className="text-right mr-2">
                    <span className="text-xs text-muted-foreground block">Order Total</span>
                    <span className="text-xl font-serif font-bold text-primary">
                      ₹{order.total_amount?.toFixed(2)}
                    </span>
                  </div>

                  <Select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onValueChange={(val) => handleStatusChange(order.id, val)}
                  >
                    <SelectTrigger className="w-40 bg-secondary border-border/80 text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location & Instructions info */}
              {(order.delivery_address || order.table_number || order.notes) && (
                <div className="py-3 text-xs bg-secondary/40 -mx-5 px-5 sm:-mx-6 sm:px-6 border-b border-border/40 text-muted-foreground flex flex-wrap gap-4">
                  {order.delivery_address && (
                    <span className="flex items-center gap-1.5 text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> <strong>Delivery:</strong> {order.delivery_address}
                    </span>
                  )}
                  {order.table_number && (
                    <span className="flex items-center gap-1.5 text-foreground">
                      <UtensilsCrossed className="h-3.5 w-3.5 text-primary" /> <strong>Dine-In:</strong> Table #{order.table_number}
                    </span>
                  )}
                  {order.notes && (
                    <span className="italic text-primary/90">
                      <strong>Cooking Notes:</strong> "{order.notes}"
                    </span>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="pt-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
                  Kitchen Items:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-card border border-border/60 p-2.5 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{item.name}</span>
                        <span className="text-[11px] text-muted-foreground block capitalize">
                          Size: {item.size} &bull; Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-mono text-primary font-bold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-16 bg-card border border-border/80 rounded-xl">
              <p className="text-muted-foreground text-sm">No orders matching "{filter}"</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;