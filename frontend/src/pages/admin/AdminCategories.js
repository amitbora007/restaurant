import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, FolderPlus, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { useAuth } from '../../App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;
const PAGE_SIZE = 8;

const AdminCategories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image_url: '', order: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingId) {
        await axios.put(`${API}/categories/${editingId}`, formData, config);
        toast.success('Category updated successfully');
      } else {
        await axios.post(`${API}/categories`, formData, config);
        toast.success('Category created successfully');
      }
      setOpen(false);
      setFormData({ name: '', description: '', image_url: '', order: 0 });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image_url: cat.image_url || '',
      order: cat.order || 0,
    });
    setOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/categories/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Category "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchCategories();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const totalPages = Math.ceil(categories.length / PAGE_SIZE) || 1;
  const paginatedCategories = categories.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground" data-testid="categories-heading">
              Categories Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your dishes into browsable menu sections
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', description: '', image_url: '', order: categories.length + 1 });
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 self-start sm:self-auto"
                data-testid="add-category-btn"
              >
                <Plus className="h-4 w-4" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">{editingId ? 'Edit' : 'Add'} Category</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update category name and sorting order.' : 'Fill in details to create a new category.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="cat_name" className="text-xs uppercase tracking-wider text-muted-foreground">Category Name</Label>
                  <Input
                    id="cat_name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 bg-background"
                    placeholder="e.g. DESSERTS & KULFI"
                    data-testid="category-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="cat_desc" className="text-xs uppercase tracking-wider text-muted-foreground">Description (Optional)</Label>
                  <Input
                    id="cat_desc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 bg-background"
                    placeholder="Short description of this section"
                  />
                </div>
                <div>
                  <Label htmlFor="cat_img" className="text-xs uppercase tracking-wider text-muted-foreground">Image URL</Label>
                  <Input
                    id="cat_img"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="mt-1 bg-background"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="cat_order" className="text-xs uppercase tracking-wider text-muted-foreground">Display Order</Label>
                  <Input
                    id="cat_order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="mt-1 bg-background"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2" data-testid="save-category-btn">
                  Save Category
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deleteTarget} onOpenChange={(openState) => !openState && setDeleteTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle>Delete Category?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? Menu items in this category will become unassigned.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-card border border-border/80 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-border transition-colors shadow-sm"
              data-testid={`category-row-${cat.id}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0">
                    <FolderPlus className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-base text-foreground truncate">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{cat.description || `Order index: ${cat.order}`}</p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(cat)}
                  className="hover:text-primary hover:bg-primary/10"
                  aria-label={`Edit ${cat.name}`}
                  data-testid={`edit-category-${cat.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(cat)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${cat.name}`}
                  data-testid={`delete-category-${cat.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {categories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={categories.length}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            itemLabel="categories"
            className="pt-4 border-t border-border/60"
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;