'use client';

import { Grid, Home, Maximize, Ruler } from 'lucide-react';
import { motion, type Variants } from 'motion/react';

const services = [
  {
    name: 'Bathroom Renovations',
    description: 'Complete waterproof tiling solutions for custom showers, floors, and elegant wall features.',
    icon: Home,
  },
  {
    name: 'Kitchen Backsplashes',
    description: 'Beautiful, easy-to-clean backsplashes that protect your walls and elevate your kitchen design.',
    icon: Grid,
  },
  {
    name: 'Large Format Tiles',
    description: 'Expert handling and installation of modern large-format porcelain and stone slabs.',
    icon: Maximize,
  },
  {
    name: 'Custom Layouts',
    description: 'Intricate patterns, herringbone, chevron, and custom mosaic installations.',
    icon: Ruler,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

export function Services() {
  return (
    <section id="services" className="py-32 bg-surface-50 relative overflow-hidden transition-colors duration-500">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary-500/5 to-transparent skew-x-12 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl transition-colors">
            Professional Tiling Services
          </h2>
          <p className="mt-6 text-xl text-surface-600 leading-relaxed font-light transition-colors">
            We specialize in all aspects of floor and wall tiling. From standard ceramic to high-end natural stone, we deliver flawless results on every project.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((service) => (
            <motion.div 
              key={service.name} 
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group bg-white p-8 rounded-[2rem] shadow-sm border border-surface-100 hover:shadow-2xl hover:shadow-surface-900/5 transition-all duration-300"
            >
              <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary-600 group-hover:scale-110 transition-all duration-500 shadow-inner shadow-primary-100/50 group-hover:shadow-primary-600/50">
                <service.icon className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors duration-500" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                {service.name}
              </h3>
              <p className="text-surface-600 leading-relaxed transition-colors">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
