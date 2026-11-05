import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, List, ShoppingBag, IndianRupee, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    categories: 0,
    menuItems: 0,
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [categoriesRes, itemsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/menu-items`),
        axios.get(`${API}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders
        .filter((o) => ['paid', 'preparing', 'out_for_delivery', 'completed'].includes(o.status))
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      const activeOrders = orders.filter((o) =>
        ['pending', 'paid', 'preparing', 'out_for_delivery'].includes(o.status)
      ).length;

      setStats({
        categories: categoriesRes.data?.length || 0,
        menuItems: itemsRes.data?.length || 0,
        totalOrders: orders.length,
        activeOrders,
        totalRevenue,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground" data-testid="dashboard-heading">
              Executive Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live statistics and restaurant performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/menu-items">
              <Button size="sm" variant="outline" className="border-border hover:bg-secondary hover:text-foreground hover:border-primary/50">
                Manage Menu
              </Button>
            </Link>
            <Link to="/admin/orders">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                View All Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div
            className="bg-card border border-border/80 p-6 rounded-xl hover:border-primary/50 transition-colors shadow-sm"
            data-testid="stat-card-revenue"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Revenue
              </span>
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-foreground">
              ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-emerald-400" /> Settled & Active Orders
            </span>
          </div>

          {/* Active Orders */}
          <div
            className="bg-card border border-border/80 p-6 rounded-xl hover:border-primary/50 transition-colors shadow-sm"
            data-testid="stat-card-active-orders"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active In Kitchen
              </span>
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-primary">
              {stats.activeOrders}
            </p>
            <span className="text-xs text-muted-foreground mt-2 block">
              Requires fulfillment action
            </span>
          </div>

          {/* Menu Items */}
          <div
            className="bg-card border border-border/80 p-6 rounded-xl hover:border-primary/50 transition-colors shadow-sm"
            data-testid="stat-card-items"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Menu Offerings
              </span>
              <div className="p-2.5 bg-secondary rounded-lg text-foreground">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {stats.menuItems}
            </p>
            <span className="text-xs text-muted-foreground mt-2 block">
              Across {stats.categories} culinary categories
            </span>
          </div>

          {/* Lifetime Orders */}
          <div
            className="bg-card border border-border/80 p-6 rounded-xl hover:border-primary/50 transition-colors shadow-sm"
            data-testid="stat-card-orders"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lifetime Orders
              </span>
              <div className="p-2.5 bg-secondary rounded-lg text-foreground">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {stats.totalOrders}
            </p>
            <span className="text-xs text-muted-foreground mt-2 block">
              Total customer checkouts
            </span>
          </div>
        </div>

        {/* Recent Orders Preview */}
        <div className="bg-card border border-border/80 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h2 className="text-lg font-serif font-bold text-foreground">Recent Customer Orders</h2>
              <p className="text-xs text-muted-foreground">Latest transactions placed through the platform</p>
            </div>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading orders...</p>
          ) : recentOrders.length > 0 ? (
            <div className="divide-y divide-border/60">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {order.customer_name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : order.status === 'preparing'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.items?.length || 0} items &bull; {order.fulfillment_type?.replace('_', ' ')} &bull;{' '}
                      {new Date(order.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="text-right flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-base font-serif font-bold text-primary">
                      ₹{order.total_amount?.toFixed(2)}
                    </span>
                    <Link to="/admin/orders">
                      <Button variant="outline" size="sm" className="text-xs h-8 hover:bg-secondary hover:text-foreground hover:border-primary/50">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No orders placed yet. As customers order, they will appear here in real-time.
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;