'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

const images = [
  {
    src: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=1200',
    alt: 'Modern bathroom tiling',
    category: 'Bathroom',
  },
  {
    src: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200',
    alt: 'Subway tile kitchen backsplash',
    category: 'Kitchen',
  },
  {
    src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200',
    alt: 'Large format floor tiles',
    category: 'Flooring',
  },
  {
    src: 'https://images.unsplash.com/photo-1552858725-2758b5fb1286?auto=format&fit=crop&q=80&w=1200',
    alt: 'Marble effect shower enclosure',
    category: 'Bathroom',
  },
  {
    src: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200',
    alt: 'Herringbone pattern floor tiles',
    category: 'Flooring',
  },
  {
    src: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?auto=format&fit=crop&q=80&w=1200',
    alt: 'Decorative patterned kitchen tiles',
    category: 'Kitchen',
  },
];

export function Gallery() {
  return (
    <section id="gallery" className="py-32 bg-white transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl transition-colors">
              Recent Work
            </h2>
            <p className="mt-6 text-xl text-surface-600 leading-relaxed font-light transition-colors">
              Explore our portfolio of completed projects. We take pride in our attention to detail and precision cuts.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {images.map((image, index) => (
            <motion.div 
              key={index}
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 30 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
              }}
              className="group relative overflow-hidden rounded-[2rem] aspect-[4/3] bg-surface-100 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-surface-900/10 transition-all duration-500"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-950/90 via-surface-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <span className="inline-block px-4 py-1.5 bg-primary-600/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 shadow-lg">
                    {image.category}
                  </span>
                  <p className="text-white font-medium text-xl leading-tight drop-shadow-md">{image.alt}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
