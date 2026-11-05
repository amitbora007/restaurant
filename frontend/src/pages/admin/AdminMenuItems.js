import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Utensils, AlertTriangle, Upload, Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { useAuth } from '../../App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;
const PAGE_SIZE = 10;

const AdminMenuItems = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price_half: '',
    price_full: '',
    image_url: '',
    is_available: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        axios.get(`${API}/menu-items`),
        axios.get(`${API}/categories`),
      ]);
      setItems(itemsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (error) {
      toast.error('Failed to load menu items');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const response = await axios.post(`${API}/upload-image`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData((prev) => ({ ...prev, image_url: response.data.url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Image upload failed (must be under 5MB)');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        ...formData,
        price_half: formData.price_half ? parseFloat(formData.price_half) : null,
        price_full: formData.price_full ? parseFloat(formData.price_full) : null,
      };
      if (editingId) {
        await axios.put(`${API}/menu-items/${editingId}`, payload, config);
        toast.success('Menu item updated');
      } else {
        await axios.post(`${API}/menu-items`, payload, config);
        toast.success('Menu item created');
      }
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        category_id: '',
        price_half: '',
        price_full: '',
        image_url: '',
        is_available: true,
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      category_id: item.category_id,
      price_half: item.price_half !== null ? item.price_half.toString() : '',
      price_full: item.price_full !== null ? item.price_full.toString() : '',
      image_url: item.image_url || '',
      is_available: item.is_available !== false,
    });
    setOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/menu-items/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`"${deleteTarget.name}" deleted from menu`);
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE) || 1;
  const paginatedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground" data-testid="menu-items-heading">
              Menu Items ({items.length})
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add, update prices, and manage dish availability
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: '',
                    description: '',
                    category_id: categories[0]?.id || '',
                    price_half: '',
                    price_full: '',
                    image_url: '',
                    is_available: true,
                  });
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 self-start sm:self-auto"
                data-testid="add-menu-item-btn"
              >
                <Plus className="h-4 w-4" /> Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">{editingId ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update dish details, portions, and pricing.' : 'Fill in details to add a new culinary creation.'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="item_name" className="text-xs uppercase tracking-wider text-muted-foreground">Dish Name</Label>
                  <Input
                    id="item_name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 bg-background"
                    placeholder="e.g. Afghani Momos"
                    data-testid="item-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="item_desc" className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
                  <Input
                    id="item_desc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 bg-background"
                    placeholder="Rich description of spices, ingredients"
                  />
                </div>

                <div>
                  <Label htmlFor="item_cat" className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                  >
                    <SelectTrigger className="mt-1 bg-background" data-testid="item-category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_half" className="text-xs uppercase tracking-wider text-muted-foreground">Half Price (₹)</Label>
                    <Input
                      id="price_half"
                      type="number"
                      step="0.01"
                      value={formData.price_half}
                      onChange={(e) => setFormData({ ...formData, price_half: e.target.value })}
                      className="mt-1 bg-background"
                      placeholder="Optional"
                      data-testid="item-price-half-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_full" className="text-xs uppercase tracking-wider text-muted-foreground">Full Price (₹)</Label>
                    <Input
                      id="price_full"
                      type="number"
                      step="0.01"
                      value={formData.price_full}
                      onChange={(e) => setFormData({ ...formData, price_full: e.target.value })}
                      className="mt-1 bg-background"
                      placeholder="Full portion price"
                      data-testid="item-price-full-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="item_img_file" className="text-xs uppercase tracking-wider text-muted-foreground">Dish Image</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      id="item_img_file"
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      disabled={uploading}
                      className="bg-background text-xs"
                      data-testid="item-image-upload"
                    />
                    {uploading && <span className="text-xs text-primary animate-pulse">Uploading...</span>}
                  </div>
                  {formData.image_url && (
                    <div className="mt-2 relative w-20 h-20 rounded-md overflow-hidden border border-border">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2" data-testid="save-item-btn">
                  Save Item
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search items by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border/80"
          />
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deleteTarget} onOpenChange={(openState) => !openState && setDeleteTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle>Delete Menu Item?</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove <strong>"{deleteTarget?.name}"</strong> from the public menu?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Menu Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 flex gap-4 items-center justify-between hover:border-border transition-colors shadow-sm"
              data-testid={`item-row-${item.id}`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-primary flex-shrink-0">
                    <Utensils className="h-6 w-6" />
                  </div>
                )}

                <div className="min-w-0 pr-2">
                  <h3 className="font-serif font-bold text-base text-foreground truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {item.description || 'Artisanal recipe'}
                  </p>
                  <p className="text-primary font-serif font-semibold text-xs mt-1">
                    {item.price_half && `Half: ₹${item.price_half}`}
                    {item.price_half && item.price_full && ' | '}
                    {item.price_full && `Full: ₹${item.price_full}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(item)}
                  className="hover:text-primary hover:bg-primary/10"
                  aria-label={`Edit ${item.name}`}
                  data-testid={`edit-item-${item.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(item)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${item.name}`}
                  data-testid={`delete-item-${item.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            itemLabel="menu items"
            className="pt-4 border-t border-border/60"
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMenuItems;