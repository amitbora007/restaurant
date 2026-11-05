import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChefHat, Flame, Wine, Clock, MapPin, Phone } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';

const Home = () => {
  return (
    <Layout>
      {/* 1. Cinematic Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background Atmosphere Image with Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1571585835576-170807b5878e?auto=format&fit=crop&w=2000&q=85"
            alt="Food Hub opulent interior ambiance"
            className="w-full h-full object-cover scale-105 filter brightness-[0.38] contrast-105"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,9,11,0.85)_100%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-20">
          <motion.h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-foreground leading-[1.08] mb-8 text-balance"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            data-testid="hero-heading"
          >
            A Symphony of <br />
            <span className="text-primary font-serif">Unforgettable</span> Flavours.
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light text-pretty"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Where traditional Indian royal tandoor, authentic East Asian wok artistry, and refined Continental classics unite in culinary mastery.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <Link to="/menu" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide px-8 py-6 text-base rounded-md shadow-lg shadow-primary/10 transition-transform active:scale-95"
                data-testid="explore-menu-btn"
              >
                Order Online Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#culinary-pillars" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-border/80 hover:border-primary text-foreground hover:text-primary hover:bg-primary/10 px-8 py-6 text-base rounded-md transition-colors"
              >
                Discover Our Heritage
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 2. Culinary Pillars Section */}
      <section id="culinary-pillars" className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-balance" data-testid="why-choose-heading">
              Three Culinary Worlds, <br />
              One Impeccable Standard.
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed text-pretty">
            Our kitchens are compartmentalized into dedicated stations headed by specialized master chefs, guaranteeing true culinary authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <motion.div
            className="bg-card border border-border/80 p-8 rounded-lg hover:border-primary/40 transition-colors group relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            data-testid="feature-card-quality"
          >
            <div className="flex items-center gap-3 mb-4 text-primary">
              <Flame className="h-6 w-6 text-primary flex-shrink-0" />
              <h3 className="text-2xl font-serif font-bold text-foreground">Clay Oven Tandoor</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-pretty">
              Slow-cooked gravies infused with freshly ground whole spices and smoky tandoori kebabs blistered over aromatic natural charcoal.
            </p>
            <span className="text-xs uppercase tracking-wider text-primary font-medium">
              Dal Makhani &bull; Chaap &bull; Naans
            </span>
          </motion.div>

          {/* Pillar 2 */}
          <motion.div
            className="bg-card border border-border/80 p-8 rounded-lg hover:border-primary/40 transition-colors group relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            data-testid="feature-card-service"
          >
            <div className="flex items-center gap-3 mb-4 text-primary">
              <ChefHat className="h-6 w-6 text-primary flex-shrink-0" />
              <h3 className="text-2xl font-serif font-bold text-foreground">Master Wok Craft</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-pretty">
              Handcrafted dim sums and momos with gossamer skins, sizzling noodles, and fiery Schezwan gravies balancing heat with umami.
            </p>
            <span className="text-xs uppercase tracking-wider text-primary font-medium">
              Steamed Momos &bull; Chilli Paneer &bull; Hakka Noodles
            </span>
          </motion.div>

          {/* Pillar 3 */}
          <motion.div
            className="bg-card border border-border/80 p-8 rounded-lg hover:border-primary/40 transition-colors group relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            data-testid="feature-card-location"
          >
            <div className="flex items-center gap-3 mb-4 text-primary">
              <Wine className="h-6 w-6 text-primary flex-shrink-0" />
              <h3 className="text-2xl font-serif font-bold text-foreground">Continental Bistro</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-pretty">
              Al dente pastas tossed in velvety herb-infused creams, handcrafted gourmet burgers, and artisanal mocktails shaken to order.
            </p>
            <span className="text-xs uppercase tracking-wider text-primary font-medium">
              Mix Sauce Penne &bull; FH Burger &bull; Virgin Mojitos
            </span>
          </motion.div>
        </div>
      </section>

      {/* 3. Asymmetric "Tetris" Food Showcase */}
      <section className="py-24 bg-card/40 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Story Col */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance">
                Crafted for Discerning Palates
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 text-pretty">
                Every preparation at Food Hub is guided by time-honored techniques: 24-hour slow reduction for our gravies, dough kneaded fresh every morning, and produce sourced directly from trusted regional markets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/menu">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5 text-sm font-medium tracking-wide"
                    data-testid="view-menu-btn"
                  >
                    Explore Complete Menu (50+ Items)
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Asymmetric Imagery Grid */}
            <motion.div
              className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4 sm:space-y-6">
                <div className="relative overflow-hidden rounded-lg border border-border group aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1708184528306-f75a0a5118ee?auto=format&fit=crop&w=700&q=80"
                    alt="Authentic North Indian Gourmet Curry"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent opacity-90" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs text-amber-300 font-semibold tracking-wider uppercase drop-shadow-sm">Royal Indian</span>
                    <h3 className="text-lg font-serif font-bold text-foreground">Paneer Butter Masala</h3>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-lg border border-border group aspect-square">
                  <img
                    src="https://images.unsplash.com/photo-1719454261026-fc7f0ffc1835?auto=format&fit=crop&w=700&q=80"
                    alt="Artisanal Steamed Dumplings"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent opacity-90" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs text-amber-300 font-semibold tracking-wider uppercase drop-shadow-sm">Himalayan Delicacy</span>
                    <h3 className="text-lg font-serif font-bold text-foreground">Kurkure & Afghani Momos</h3>
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6 pt-8">
                <div className="relative overflow-hidden rounded-lg border border-border group aspect-square">
                  <img
                    src="https://images.unsplash.com/photo-1734356959885-54fe2e99c1cd?auto=format&fit=crop&w=700&q=80"
                    alt="Gourmet Italian Pasta"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent opacity-90" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs text-amber-300 font-semibold tracking-wider uppercase drop-shadow-sm">Continental</span>
                    <h3 className="text-lg font-serif font-bold text-foreground">Mix Sauce Pasta</h3>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-lg border border-border group aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1768949005507-8c0f571285f4?auto=format&fit=crop&w=700&q=80"
                    alt="Candlelit Dining Atmosphere"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent opacity-90" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs text-amber-300 font-semibold tracking-wider uppercase drop-shadow-sm">Ambiance</span>
                    <h3 className="text-lg font-serif font-bold text-foreground">Dine-in Experience</h3>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Reservations & Location Banner */}
      <section className="py-20 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-card border border-primary/30 rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3 text-balance">
                Experience Warm Hospitality in Badarpur
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                Enjoy comfortable air-conditioned dining with friends and family, or place an order online for doorstep delivery with real-time tracking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <Link to="/menu" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-6 font-medium">
                  Order Online
                </Button>
              </Link>
              <a href="tel:+919876543210" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-border hover:border-primary text-foreground hover:bg-secondary px-6 py-6 gap-2 transition-colors">
                  <Phone className="h-4 w-4 text-primary" /> Call for Table
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;