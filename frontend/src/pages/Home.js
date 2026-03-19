import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, UtensilsCrossed, Clock, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <Layout>
      <section className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1571585835576-170807b5878e?w=1920&q=80"
            alt="Elegant restaurant interior"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background" />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              data-testid="hero-heading"
            >
              Welcome to
              <span className="block text-primary mt-2">The Flavour Junction</span>
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Experience the finest Indian, Chinese & Continental cuisine crafted with passion
              and served with elegance.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link to="/menu">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 font-medium tracking-wide px-8 py-6 text-lg"
                  data-testid="explore-menu-btn"
                >
                  Explore Our Menu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="why-choose-heading">
            Why Choose Us
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We bring together the best of three culinary worlds
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="bg-card border border-border p-8 hover:border-primary/50 transition-all duration-300"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            data-testid="feature-card-quality"
          >
            <UtensilsCrossed className="h-12 w-12 text-primary mb-6" />
            <h3 className="text-2xl font-bold mb-4">Quality Ingredients</h3>
            <p className="text-muted-foreground">
              We source only the finest ingredients to create dishes that tantalize your taste
              buds.
            </p>
          </motion.div>

          <motion.div
            className="bg-card border border-border p-8 hover:border-primary/50 transition-all duration-300"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            data-testid="feature-card-service"
          >
            <Clock className="h-12 w-12 text-primary mb-6" />
            <h3 className="text-2xl font-bold mb-4">Fast Service</h3>
            <p className="text-muted-foreground">
              Quick preparation and delivery without compromising on quality or taste.
            </p>
          </motion.div>

          <motion.div
            className="bg-card border border-border p-8 hover:border-primary/50 transition-all duration-300"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            data-testid="feature-card-location"
          >
            <MapPin className="h-12 w-12 text-primary mb-6" />
            <h3 className="text-2xl font-bold mb-4">Prime Location</h3>
            <p className="text-muted-foreground">
              Conveniently located in Badarpur Extension with easy access and ample parking.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-32 bg-card/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Our Culinary Excellence
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                From authentic Indian curries to Chinese delicacies and Continental favorites,
                our diverse menu caters to every palate. Each dish is prepared by our expert
                chefs using traditional techniques and modern innovation.
              </p>
              <Link to="/menu">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  data-testid="view-menu-btn"
                >
                  View Full Menu
                </Button>
              </Link>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1708184528306-f75a0a5118ee?w=600&q=80"
                alt="Indian Cuisine"
                className="w-full h-64 object-cover border border-border hover:border-primary/50 transition-colors"
              />
              <img
                src="https://images.unsplash.com/photo-1719454261026-fc7f0ffc1835?w=600&q=80"
                alt="Chinese Cuisine"
                className="w-full h-64 object-cover border border-border hover:border-primary/50 transition-colors mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1734356959885-54fe2e99c1cd?w=600&q=80"
                alt="Continental Cuisine"
                className="w-full h-64 object-cover border border-border hover:border-primary/50 transition-colors"
              />
              <img
                src="https://images.unsplash.com/photo-1768949005507-8c0f571285f4?w=600&q=80"
                alt="Fine Dining"
                className="w-full h-64 object-cover border border-border hover:border-primary/50 transition-colors mt-8"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;