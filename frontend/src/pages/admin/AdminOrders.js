import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold mb-8" data-testid="orders-heading">Orders</h1>
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border border-border p-6" data-testid={`order-row-${order.id}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{order.customer_name}</h3>
                  <p className="text-muted-foreground text-sm">{order.customer_email} | {order.customer_phone}</p>
                  <p className="text-sm mt-1"><span className={`inline-block px-2 py-1 rounded text-xs font-medium ${order.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{order.status}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">₹{order.total_amount.toFixed(2)}</p>
                  <p className="text-muted-foreground text-sm">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold mb-2">Items:</h4>
                <ul className="space-y-1">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      {item.name} ({item.size}) x {item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-center text-muted-foreground py-12">No orders yet</p>}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;