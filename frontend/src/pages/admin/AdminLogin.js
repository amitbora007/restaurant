import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    admin_key: '',
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      login(response.data.access_token);
      toast.success(isLogin ? 'Authentication successful!' : 'Admin registered successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Auth error:', error);
      const detail = error.response?.data?.detail;
      toast.error(detail || (isLogin ? 'Login failed' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background text-foreground relative">
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dining Front
      </Link>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-card border border-primary/30 flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1" data-testid="admin-login-heading">
            Food Hub
          </h1>
          <p className="text-xs uppercase tracking-widest text-primary font-medium">
            Management Portal
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-6 sm:p-8 shadow-xl">
          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="login-tab">
                Staff Login
              </TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">
                Register Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="admin@flavourjunction.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background border-border/80"
                    data-testid="login-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background border-border/80"
                    data-testid="login-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2 py-5 font-medium shadow-md"
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="full_name" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    placeholder="e.g. Master Chef / Manager"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background border-border/80"
                    data-testid="register-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="reg_email" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Work Email
                  </Label>
                  <Input
                    id="reg_email"
                    name="email"
                    type="email"
                    required
                    placeholder="staff@flavourjunction.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background border-border/80"
                    data-testid="register-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="reg_password" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="reg_password"
                    name="password"
                    type="password"
                    required
                    placeholder="Choose secure password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background border-border/80"
                    data-testid="register-password-input"
                  />
                </div>
                <div>
                  <Label htmlFor="admin_key" className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-primary" /> Admin Invite Key
                  </Label>
                  <Input
                    id="admin_key"
                    name="admin_key"
                    type="password"
                    placeholder="Configured ADMIN_REGISTRATION_KEY"
                    value={formData.admin_key}
                    onChange={handleInputChange}
                    className="mt-1.5 bg-background border-border/80"
                    data-testid="register-key-input"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Gated for authorized restaurant management only.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2 py-5 font-medium shadow-md"
                  data-testid="register-submit-btn"
                >
                  {loading ? 'Registering Account...' : 'Create Admin Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;