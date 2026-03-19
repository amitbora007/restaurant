import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart, removeFromCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/menu-items`),
      ]);
      setCategories(categoriesRes.data);
      setMenuItems(itemsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item, size) => {
    const price = size === 'half' ? item.price_half : item.price_full;
    if (!price) {
      toast.error('This size is not available');
      return;
    }
    addToCart({
      menu_item_id: item.id,
      name: item.name,
      price,
      size,
      image_url: item.image_url,
    });
    toast.success(`${item.name} (${size}) added to cart`);
  };

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category_id === selectedCategory);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="menu-page-heading">
            Our Menu
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore our diverse selection of dishes
          </p>
        </motion.div>

        <div className="mb-12">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid="category-tab-all"
              >
                All
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid={`category-tab-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {filteredItems.map((item, index) => (
            <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} removeFromCart={removeFromCart} index={index} />
          ))}
        </motion.div>

        {filteredItems.length === 0 && (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">No items found in this category</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

const MenuItemCard = ({ item, onAddToCart, removeFromCart, index }) => {
  const { cartItems } = useCart();
  const [selectedSize, setSelectedSize] = useState(
    item.price_full && !item.price_half ? 'full' : 'half'
  );

  const hasHalf = item.price_half !== null && item.price_half !== undefined;
  const hasFull = item.price_full !== null && item.price_full !== undefined;

  const itemCountInCart = cartItems
    .filter((cartItem) => cartItem.menu_item_id === item.id)
    .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

  return (
    <motion.div
      className="bg-card border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      data-testid={`menu-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {item.image_url && (
        <div className="aspect-square overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold flex-1">{item.name}</h3>
          {itemCountInCart > 0 && (
            <span
              className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ml-2"
              data-testid={`cart-count-${item.id}`}
            >
              {itemCountInCart}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
        )}
        <div className="flex items-center justify-between mb-4">
          <div>
            {hasHalf && hasFull ? (
              <div className="flex gap-2">
                <span className="text-primary font-semibold">Half: ₹{item.price_half}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-primary font-semibold">Full: ₹{item.price_full}</span>
              </div>
            ) : hasHalf ? (
              <span className="text-primary font-semibold text-lg">₹{item.price_half}</span>
            ) : (
              <span className="text-primary font-semibold text-lg">₹{item.price_full}</span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            {hasHalf && hasFull && (
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-24" data-testid={`size-select-${item.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="half">Half</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              onClick={() => onAddToCart(item, selectedSize)}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              data-testid={`add-to-cart-btn-${item.id}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
          {itemCountInCart > 0 && (
            <Button
              onClick={() => {
                const itemsToRemove = cartItems.filter(ci => ci.menu_item_id === item.id);
                itemsToRemove.forEach(ci => removeFromCart(ci.menu_item_id, ci.size));
                toast.success(`${item.name} removed from cart`);
              }}
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
              data-testid={`remove-from-cart-btn-${item.id}`}
            >
              Remove from Cart
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Menu;