import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Package, List, ShoppingBag } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    categories: 0,
    menuItems: 0,
    orders: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const [categoriesRes, itemsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/menu-items`),
        axios.get(`${API}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setStats({
        categories: categoriesRes.data.length,
        menuItems: itemsRes.data.length,
        orders: ordersRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold mb-8" data-testid="dashboard-heading">
          Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="bg-card border border-border p-6 hover:border-primary/50 transition-colors"
            data-testid="stat-card-categories"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded">
                <List className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Categories</p>
                <p className="text-3xl font-bold">{stats.categories}</p>
              </div>
            </div>
          </div>
          <div
            className="bg-card border border-border p-6 hover:border-primary/50 transition-colors"
            data-testid="stat-card-items"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Menu Items</p>
                <p className="text-3xl font-bold">{stats.menuItems}</p>
              </div>
            </div>
          </div>
          <div
            className="bg-card border border-border p-6 hover:border-primary/50 transition-colors"
            data-testid="stat-card-orders"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Orders</p>
                <p className="text-3xl font-bold">{stats.orders}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;