'use client';

import { ArrowRight, Home, UtensilsCrossed, Maximize, Landmark } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import Image from 'next/image';

const services = [
  {
    name: 'Bathroom & Ensuite Renovations',
    description: 'Complete AS 3740 waterproofed tiling solutions, curbless walk-in showers, and feature walls.',
    icon: Home,
    image: '/images/projects/project-02-charcoal-shower.jpg',
    tag: 'Waterproofing Certified'
  },
  {
    name: 'Kitchen & Alfresco Splashbacks',
    description: 'Stain-resistant porcelain slabs, subway backsplashes, and curved fluted feature island wraps.',
    icon: UtensilsCrossed,
    image: '/images/projects/project-12-modern-kitchen.jpg',
    tag: 'Heat & Stain Resistant'
  },
  {
    name: 'Pool Coping & Outdoor Patios',
    description: 'Slip-rated travertine pavers, waterline glass mosaics, and laser-aligned veranda layouts.',
    icon: Maximize,
    image: '/images/projects/project-11-pool-alfresco.jpg',
    tag: 'R11 Non-Slip External'
  },
  {
    name: 'Precision Screed & Custom Patterns',
    description: '4-way diagonal envelope drainage falls, Victorian tessellated layouts, and 45° mitered edging.',
    icon: Landmark,
    image: '/images/projects/project-08-envelope-drain.jpg',
    tag: 'AS 3958.1 Laser Level'
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export function Services() {
  return (
    <section id="services" className="py-20 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold tracking-widest uppercase mb-3">
              Full-Spectrum Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900 transition-colors">
              Specialized Architectural Tiling
            </h2>
            <p className="mt-3 text-base text-surface-600 font-light leading-relaxed">
              Every project is installed to strict Australian Standards with premium adhesives, laser alignment, and a 10-year warranty.
            </p>
          </div>

          <a
            href="#quote"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors group"
          >
            <span>Request customized project estimate</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* 4 Core Services Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div 
                key={service.name} 
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-surface-900/10 border border-surface-200/80 transition-all duration-300 flex flex-col"
              >
                {/* Photo Header */}
                <div className="relative h-44 w-full overflow-hidden bg-surface-200">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-surface-950/20 to-transparent" />
                  
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-surface-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/20">
                    {service.tag}
                  </span>

                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-surface-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-surface-600 leading-relaxed font-light">
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
