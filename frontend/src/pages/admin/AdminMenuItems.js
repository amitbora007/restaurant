import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminMenuItems = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', category_id: '', price_half: '', price_full: '', image_url: '', is_available: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([axios.get(`${API}/menu-items`), axios.get(`${API}/categories`)]);
      setItems(itemsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API}/upload-image`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      setFormData((prev) => ({ ...prev, image_url: response.data.url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { ...formData, price_half: formData.price_half ? parseFloat(formData.price_half) : null, price_full: formData.price_full ? parseFloat(formData.price_full) : null };
      if (editingId) {
        await axios.put(`${API}/menu-items/${editingId}`, payload, config);
        toast.success('Item updated');
      } else {
        await axios.post(`${API}/menu-items`, payload, config);
        toast.success('Item created');
      }
      setOpen(false);
      setFormData({ name: '', description: '', category_id: '', price_half: '', price_full: '', image_url: '', is_available: true });
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ name: item.name, description: item.description || '', category_id: item.category_id, price_half: item.price_half || '', price_full: item.price_full || '', image_url: item.image_url || '', is_available: item.is_available });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`${API}/menu-items/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Item deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold" data-testid="menu-items-heading">Menu Items</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setFormData({ name: '', description: '', category_id: '', price_half: '', price_full: '', image_url: '', is_available: true }); }} data-testid="add-menu-item-btn">
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update menu item details, pricing, and image.' : 'Fill in the details to create a new menu item.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="item-name-input" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                    <SelectTrigger data-testid="item-category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Half Price</Label>
                    <Input type="number" step="0.01" value={formData.price_half} onChange={(e) => setFormData({ ...formData, price_half: e.target.value })} data-testid="item-price-half-input" />
                  </div>
                  <div>
                    <Label>Full Price</Label>
                    <Input type="number" step="0.01" value={formData.price_full} onChange={(e) => setFormData({ ...formData, price_full: e.target.value })} data-testid="item-price-full-input" />
                  </div>
                </div>
                <div>
                  <Label>Image</Label>
                  <div className="flex gap-2 mt-2">
                    <Input type="file" onChange={handleImageUpload} accept="image/*" disabled={uploading} data-testid="item-image-upload" />
                    {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                  {formData.image_url && <img src={formData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover border" />}
                </div>
                <Button type="submit" className="w-full" data-testid="save-item-btn">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border p-6 flex gap-6" data-testid={`item-row-${item.id}`}>
              {item.image_url && <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover border" />}
              <div className="flex-1">
                <h3 className="text-xl font-bold">{item.name}</h3>
                {item.description && <p className="text-muted-foreground text-sm">{item.description}</p>}
                <p className="text-primary font-semibold mt-2">
                  {item.price_half && `Half: ₹${item.price_half}`}
                  {item.price_half && item.price_full && ' | '}
                  {item.price_full && `Full: ₹${item.price_full}`}
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} data-testid={`edit-item-${item.id}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive" data-testid={`delete-item-${item.id}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMenuItems;