import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, X, Sparkles, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCart } from '../App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('all'); // 'all', 'veg', 'non-veg'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/menu-items`),
      ]);
      setCategories(categoriesRes.data || []);
      setMenuItems(itemsRes.data || []);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      toast.error('Unable to connect to menu service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter items by category, search query, and dietary preference
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category match
      if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      // Diet filter (Heuristic based on name/category)
      const isVeg = !item.name.toLowerCase().includes('chicken') &&
                    !item.name.toLowerCase().includes('egg') &&
                    !item.name.toLowerCase().includes('fish') &&
                    !item.name.toLowerCase().includes('mutton') &&
                    !item.name.toLowerCase().includes('meat');
      if (dietFilter === 'veg' && !isVeg) return false;
      if (dietFilter === 'non-veg' && isVeg) return false;

      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, dietFilter]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            Curating artisanal menu items...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-wider mb-4">
            <Sparkles className="h-3 w-3" /> Master Crafted Recipes
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-4" data-testid="menu-page-heading">
            Our Culinary Repertoire
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Explore 16 specialized categories crafted by dedicated culinary masters. Freshly prepared to order.
          </p>
        </motion.div>

        {/* Search & Dietary Controls */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-8">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search momos, dosas, curries, pastas, beverages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-5 bg-card border-border/80 focus:border-primary text-sm rounded-md"
              data-testid="menu-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Diet Filter Buttons */}
          <div className="md:col-span-4 flex items-center justify-end gap-2 bg-card border border-border/80 p-1 rounded-md">
            <button
              onClick={() => setDietFilter('all')}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all ${
                dietFilter === 'all'
                  ? 'bg-secondary text-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setDietFilter('veg')}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                dietFilter === 'veg'
                  ? 'bg-emerald-950/70 border border-emerald-600/50 text-emerald-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Veg
            </button>
            <button
              onClick={() => setDietFilter('non-veg')}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                dietFilter === 'non-veg'
                  ? 'bg-red-950/70 border border-red-600/50 text-red-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Non-Veg
            </button>
          </div>
        </div>

        {/* Horizontally Scrollable Sticky Category Rail */}
        <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-border/60 mb-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold'
                  : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
              data-testid="category-tab-all"
            >
              All Categories ({menuItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold'
                    : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/50'
                }`}
                data-testid={`category-tab-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredItems.map((item, index) => (
              <MenuItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/40 border border-border/60 rounded-xl p-8">
            <AlertCircle className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-foreground mb-1">
              No dishes found
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              We couldn't find any dishes matching "{searchQuery}". Try searching for another ingredient or reset the category filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-secondary hover:text-foreground hover:border-primary/50"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setDietFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Polished Item Card with Segmented Half/Full portion and inline Stepper
const MenuItemCard = ({ item, index }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [imageError, setImageError] = useState(false);

  const hasHalf = item.price_half !== null && item.price_half !== undefined && item.price_half > 0;
  const hasFull = item.price_full !== null && item.price_full !== undefined && item.price_full > 0;

  // Default portion to 'half' if available, otherwise 'full'
  const [selectedSize, setSelectedSize] = useState(hasHalf ? 'half' : 'full');

  const currentPrice = selectedSize === 'half' ? (item.price_half || item.price_full) : (item.price_full || item.price_half);

  // Check if this exact item (id + selectedSize) is in cart
  const cartItem = cartItems.find(
    (ci) => ci.menu_item_id === item.id && ci.size === selectedSize
  );
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const isVeg = !item.name.toLowerCase().includes('chicken') &&
                !item.name.toLowerCase().includes('egg') &&
                !item.name.toLowerCase().includes('fish') &&
                !item.name.toLowerCase().includes('mutton') &&
                !item.name.toLowerCase().includes('meat');

  const handleIncrement = () => {
    if (currentQuantity === 0) {
      addToCart({
        menu_item_id: item.id,
        name: item.name,
        price: currentPrice,
        size: selectedSize,
        image_url: item.image_url,
      });
      toast.success(`${item.name} (${selectedSize}) added to bag`);
    } else {
      updateQuantity(item.id, selectedSize, currentQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (currentQuantity > 0) {
      updateQuantity(item.id, selectedSize, currentQuantity - 1);
    }
  };

  return (
    <motion.div
      className="bg-card border border-border/80 rounded-lg overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-black/40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      data-testid={`menu-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div>
        {/* Card Image Header with Veg/Non-Veg Badge */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted/40">
          {item.image_url && !imageError ? (
            <img
              src={item.image_url}
              alt={item.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground/40 font-serif text-lg">
              Food Hub
            </div>
          )}

          {/* Veg / Non-Veg Indicator Badge */}
          <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md p-1.5 rounded-sm border border-border/80 shadow">
            <span
              className={`w-3 h-3 rounded-full block ${
                isVeg ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            />
          </div>

          {/* Total in cart badge for this dish (all sizes combined) */}
          {cartItems.filter(ci => ci.menu_item_id === item.id).length > 0 && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold shadow-md">
              In Bag: {cartItems.filter(ci => ci.menu_item_id === item.id).reduce((s, i) => s + i.quantity, 0)}
            </div>
          )}
        </div>

        {/* Content details */}
        <div className="p-5">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="text-lg font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
              {item.name}
            </h3>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-4">
            {item.description || 'Artisanal recipe prepared with authentic spices and freshest ingredients.'}
          </p>
        </div>
      </div>

      {/* Pricing & Cart Action Area */}
      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
          {/* Portion Selector (Half vs Full) */}
          {hasHalf && hasFull ? (
            <div className="inline-flex rounded-md bg-secondary/80 p-0.5 border border-border/60">
              <button
                type="button"
                onClick={() => setSelectedSize('half')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                  selectedSize === 'half'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                data-testid={`size-half-${item.id}`}
              >
                Half: ₹{item.price_half}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSize('full')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                  selectedSize === 'full'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                data-testid={`size-full-${item.id}`}
              >
                Full: ₹{item.price_full}
              </button>
            </div>
          ) : (
            <div className="text-base font-bold text-primary font-serif">
              ₹{currentPrice}
            </div>
          )}

          {/* Stepper / Add button */}
          <div>
            {currentQuantity > 0 ? (
              <div className="flex items-center bg-primary/10 border border-primary/40 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Decrease quantity"
                  data-testid={`decrease-item-${item.id}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span
                  className="w-8 text-center text-xs font-bold text-primary"
                  data-testid={`qty-item-${item.id}`}
                >
                  {currentQuantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Increase quantity"
                  data-testid={`increase-item-${item.id}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleIncrement}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4 gap-1.5 shadow-sm active:scale-95 transition-transform"
                data-testid={`add-to-cart-btn-${item.id}`}
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Menu;