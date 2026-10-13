/**
 * Central SEO + business data. Single source of truth for metadata,
 * JSON-LD structured data, service pages and FAQs.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.prosquaretiling.com').replace(/\/$/, '');

export const BUSINESS = {
  name: 'Pro Square Tiling',
  owner: 'Michael Perez',
  phoneDisplay: '0467 551 492',
  phoneIntl: '+61467551492',
  email: 'info@prosquaretiling.com',
  address: {
    streetAddress: '663 Banksdale Road',
    addressLocality: 'Hansonville',
    addressRegion: 'VIC',
    postalCode: '3675',
    addressCountry: 'AU',
  },
  logo: '/images/pro-square-logo.png',
  ogImage: '/images/projects/project-13-master-ensuite.jpg',
  /** Add Google Business Profile / Facebook / Instagram URLs here once live. */
  sameAs: [] as string[],
};

export const SERVICE_AREAS = [
  'Wangaratta',
  'Benalla',
  'Beechworth',
  'Myrtleford',
  'Albury–Wodonga',
  'Hansonville',
];

export const REGION = 'North East Victoria';
export const AREA_SUMMARY = 'Wangaratta, Benalla, Beechworth, Myrtleford, Albury–Wodonga & North East Victoria';

export interface FaqItem {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  name: string;
  navName: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  image: string;
  imageAlt: string;
  highlights: string[];
  sections: { heading: string; body: string }[];
  faqs: FaqItem[];
}

export const SERVICES: Service[] = [
  {
    slug: 'french-cut-mitred-tiling',
    name: 'French Cut & Mitred Edge Tiling',
    navName: 'French Cut & Mitred Edges',
    metaTitle: 'French Cut & Mitred Tiling Specialist | Wangaratta & North East VIC',
    metaDescription:
      'One of the few tilers in North East Victoria doing true French cut (45° mitred) edges, large-format slabs, herringbone and bookmatched layouts. Trim-free, high-end finishes.',
    h1: 'French Cut & Mitred Edge Tiling in North East Victoria',
    intro:
      'A French cut, or 45° mitred edge, joins two tiles at a corner so that it looks like a single solid piece of stone, with no metal or plastic trim. It takes specialised cutting gear, precise substrate prep and a lot of patience, which is why few local tilers offer it. Pro Square Tiling is one of the only specialists in the Wangaratta and Albury–Wodonga region who regularly delivers this level of finish.',
    image: '/images/projects/project-13-master-ensuite.jpg',
    imageAlt: 'Master ensuite with French cut mitred corners on Calacatta porcelain slabs, North East Victoria',
    highlights: [
      'True 45° mitred external corners with no trim',
      'Mitred shower niches, hobs, benches and vanity wraps',
      'Large-format and porcelain slab installation',
      'Herringbone, chevron, French pattern & bookmatched layouts',
      'Laser-aligned, levelling-clip installation for minimal lippage',
    ],
    sections: [
      {
        heading: 'Why choose a French cut over trim?',
        body:
          'Metal and PVC trims are quick, but they break the line of the tile and date a bathroom fast. A mitred French cut carries the pattern and colour around the corner, so niches, window reveals, steps and island benches look like they were carved from solid stone. It is the detail that separates a standard renovation from an architectural one.',
      },
      {
        heading: 'Where we use mitred edges',
        body:
          'Shower niches, bath hobs, window sills, feature walls, kitchen island wraps, floating vanity surrounds, fireplace hearths, outdoor steps and pool coping. If an edge is visible, we can usually mitre it.',
      },
      {
        heading: 'High-end layouts we specialise in',
        body:
          'Floor-to-ceiling slab walls, bookmatched marble-look porcelain, timber-look herringbone and chevron floors, Versailles (French pattern) layouts, Victorian tessellated verandas and fluted or kit-kat feature tiling. Each one is planned before the first tile goes down, so cuts land in the right places.',
      },
    ],
    faqs: [
      {
        q: 'What is a French cut in tiling?',
        a: 'A French cut (also called a mitred edge) is a 45° bevel cut on two tiles that meet at an external corner. When joined, they form a crisp, trim-free corner that looks like solid stone.',
      },
      {
        q: 'Does French cut tiling cost more?',
        a: 'Yes, mitring takes more time and precision than fitting trim, so it adds to labour on the edges involved. Many clients mitre only the most visible areas, like niches and feature walls, to get the high-end look within budget. We will price both options in your quote.',
      },
      {
        q: 'Can any tile be mitred?',
        a: 'Most porcelain, natural stone and through-body tiles mitre beautifully. Some glazed ceramics show a different colour body when cut, so we will advise on the best tile for a mitred finish before you buy.',
      },
    ],
  },
  {
    slug: 'bathroom-tiling',
    name: 'Bathroom & Ensuite Tiling',
    navName: 'Bathroom & Ensuite Tiling',
    metaTitle: 'Bathroom Tiler Wangaratta | Ensuite & Shower Tiling | Pro Square Tiling',
    metaDescription:
      'Bathroom, ensuite and shower tiling across Wangaratta, Benalla, Beechworth, Myrtleford & Albury–Wodonga. AS 3740 waterproofing, walk-in showers, feature walls, from small updates to full luxury renovations.',
    h1: 'Bathroom & Ensuite Tiling in Wangaratta & Surrounds',
    intro:
      'From a simple shower re-tile to a full floor-to-ceiling luxury ensuite, we handle the substrate, waterproofing and tiling to Australian Standards. Every bathroom gets the same attention to falls, alignment and finish, whatever the budget.',
    image: '/images/projects/project-14-grey-ensuite-after.jpg',
    imageAlt: 'Completed grey stone ensuite renovation with recessed niche, tiled by Pro Square Tiling',
    highlights: [
      'Full bathroom & ensuite tiling',
      'Curbless walk-in showers with precision screed falls',
      'AS 3740 compliant waterproofing',
      'Recessed niches, feature walls & mitred corners',
      'Small bathroom refreshes & shower re-tiles',
    ],
    sections: [
      {
        heading: 'Luxury ensuites',
        body:
          'Calacatta-look slab walls, herringbone floors, curbless showers with linear or envelope-cut drains, and French cut mitred niches. These are the details that make a bathroom feel custom-built.',
      },
      {
        heading: 'Everyday bathrooms & small updates',
        body:
          'Not every job needs to be a showpiece. We also re-tile tired showers, replace cracked floor tiles, tile laundries and powder rooms, and deliver tidy, durable bathrooms for rentals and family homes.',
      },
      {
        heading: 'Done right underneath',
        body:
          'Screed falls to the waste, membrane and bond breakers to AS 3740, and laser-levelled walls. The part you never see is what stops leaks and cracked tiles in five years’ time.',
      },
    ],
    faqs: [
      {
        q: 'How long does it take to tile a bathroom?',
        a: 'A standard bathroom is usually tiled within about a week once the room is ready, allowing for waterproofing cure times. Larger ensuites or slab and mitred work take longer. We give you a timeline with your quote.',
      },
      {
        q: 'Do you do the waterproofing as well?',
        a: 'Yes. We install waterproofing to AS 3740 as part of our bathroom tiling, so one trade is responsible for both the membrane and the tiles on top of it.',
      },
    ],
  },
  {
    slug: 'kitchen-splashbacks',
    name: 'Kitchen Splashbacks & Feature Tiling',
    navName: 'Kitchen Splashbacks',
    metaTitle: 'Kitchen Splashback Tiler Wangaratta & Albury–Wodonga | Pro Square Tiling',
    metaDescription:
      'Kitchen splashback tiling in North East Victoria: subway, porcelain slab, bookmatched and fluted kit-kat island wraps. Quick single-day splashbacks through to architectural kitchens.',
    h1: 'Kitchen Splashbacks & Feature Tiling',
    intro:
      'A new splashback is one of the quickest, most affordable ways to transform a kitchen. We tile everything from a classic subway splashback in a day to bookmatched slab walls and curved fluted island wraps.',
    image: '/images/projects/project-12-modern-kitchen.jpg',
    imageAlt: 'Modern kitchen with bookmatched slab splashback and curved fluted kit-kat tile island',
    highlights: [
      'Subway, zellige, mosaic & porcelain splashbacks',
      'Bookmatched and large-format slab splashbacks',
      'Curved and fluted kit-kat island wraps',
      'Mitred edges around windows & benchtops',
      'Outdoor kitchen & BBQ area tiling',
    ],
    sections: [
      {
        heading: 'Quick splashback upgrades',
        body:
          'Most standard kitchen splashbacks are completed in a single visit, with clean cuts around power points and windows and neat silicone joints to the benchtop.',
      },
      {
        heading: 'Architectural kitchens',
        body:
          'For new builds and high-end renovations, we tile bookmatched slabs, floor-to-ceiling feature walls and curved island wraps, finished with French cut mitred returns for a seamless look.',
      },
    ],
    faqs: [
      {
        q: 'How long does a kitchen splashback take to tile?',
        a: 'A typical kitchen splashback is usually tiled and grouted in one day. Large-format slabs, intricate patterns or mitred window reveals may take longer.',
      },
    ],
  },
  {
    slug: 'pool-outdoor-tiling',
    name: 'Pool, Alfresco & Outdoor Tiling',
    navName: 'Pool & Outdoor Tiling',
    metaTitle: 'Pool Coping & Outdoor Tiling | North East Victoria | Pro Square Tiling',
    metaDescription:
      'Pool coping, travertine pavers, alfresco, veranda and outdoor kitchen tiling across Wangaratta, Beechworth, Myrtleford, Benalla & Albury–Wodonga. Slip-rated, built for frost and heat.',
    h1: 'Pool Coping, Alfresco & Outdoor Tiling',
    intro:
      'North East Victoria swings from frosty winters to hot summers, and outdoor tiling has to cope with both. We lay slip-rated pavers, travertine and porcelain over properly graded substrates so your pool surrounds, alfresco areas and verandas last.',
    image: '/images/projects/project-11-pool-alfresco.jpg',
    imageAlt: 'Resort-style pool with travertine coping and glass mosaic waterline tiles',
    highlights: [
      'Drop-face & rebated pool coping',
      'Waterline glass mosaics',
      'Travertine & porcelain alfresco paving',
      'Victorian & heritage tessellated verandas',
      'Outdoor kitchens & BBQ surrounds',
    ],
    sections: [
      {
        heading: 'Pools & coping',
        body:
          'Precision-cut travertine and porcelain coping with drop-face rebated edges, waterline mosaics and sealed joints designed for saltwater and chlorine pools.',
      },
      {
        heading: 'Verandas, porches & heritage',
        body:
          'Victorian geometric and tessellated veranda floors with symmetrical, laser-aligned layouts and mitred borders. Perfect for heritage homes in Beechworth, Wangaratta and surrounds.',
      },
    ],
    faqs: [
      {
        q: 'What tiles are best for outdoor areas in North East Victoria?',
        a: 'Use an external-rated, slip-resistant tile (P4/R11 or higher for wet areas and pool surrounds). Porcelain and quality travertine both handle our frost and heat well when laid over a correctly graded, well-drained base.',
      },
    ],
  },
  {
    slug: 'waterproofing',
    name: 'Waterproofing & Screeding',
    navName: 'Waterproofing & Screeding',
    metaTitle: 'Bathroom Waterproofing & Screeding AS 3740 | Wangaratta | Pro Square Tiling',
    metaDescription:
      'AS 3740 bathroom and shower waterproofing, screed falls and floor levelling in Wangaratta and North East Victoria. The foundation of every leak-free tiling job.',
    h1: 'Waterproofing & Precision Screeding',
    intro:
      'Most tiling failures start underneath the tile. We prepare substrates properly, with screed falls to the waste, bond breakers and membranes installed to AS 3740, so your shower stays watertight for the long haul.',
    image: '/images/projects/project-08-envelope-drain.jpg',
    imageAlt: 'Shower floor screed with four-way envelope falls to a centre drain before tiling',
    highlights: [
      'AS 3740 compliant wet-area waterproofing',
      'Shower screed falls & envelope cuts',
      'Floor levelling for large-format tiles',
      'Curbless / step-free shower prep',
      'Balcony & external area prep',
    ],
    sections: [
      {
        heading: 'Falls that actually drain',
        body:
          'We screed showers with consistent falls to square, linear or centre wastes, including four-way envelope cuts, so water never pools in corners.',
      },
    ],
    faqs: [
      {
        q: 'Do I need waterproofing to re-tile my shower?',
        a: 'Yes. If tiles are removed in a wet area, the waterproofing underneath must be replaced to meet AS 3740. We include this in shower re-tiling quotes.',
      },
    ],
  },
  {
    slug: 'small-tiling-jobs-repairs',
    name: 'Small Tiling Jobs & Repairs',
    navName: 'Small Jobs & Repairs',
    metaTitle: 'Small Tiling Jobs & Tile Repairs Wangaratta | No Job Too Small',
    metaDescription:
      'Cracked tile replacement, regrouting, small splashbacks, laundry and toilet floors, and rental touch-ups across Wangaratta, Benalla & North East Victoria. No job too small.',
    h1: 'Small Tiling Jobs & Tile Repairs: No Job Too Small',
    intro:
      'Not every job is a full renovation, and we are happy to help with the small stuff. Cracked tiles, a tired laundry floor, a small splashback or a pre-sale touch-up all get the same care and tidy finish as our high-end work.',
    image: '/images/projects/project-06-niche-detail.jpg',
    imageAlt: 'Neat tiled shower niche detail showing clean grout lines and precise cuts',
    highlights: [
      'Cracked or drummy tile replacement',
      'Regrouting & re-siliconing',
      'Small splashbacks & laundry tiling',
      'Toilet, entry & laundry floors',
      'Rental, pre-sale & insurance repairs',
    ],
    sections: [
      {
        heading: 'Quick, tidy and reliable',
        body:
          'We turn up when we say we will, protect your home, and leave the job clean. Small jobs can often be fitted in between larger projects. Send a photo with your quote request and we can usually give a ballpark price quickly.',
      },
    ],
    faqs: [
      {
        q: 'Do you take on small tiling jobs?',
        a: 'Absolutely. From replacing a few cracked tiles to regrouting a shower or tiling a small splashback, no job is too small. Send us photos through the quote form for a fast estimate.',
      },
      {
        q: 'Can you match my existing tiles?',
        a: 'If you have spare tiles we will use them. If not, we can help source the closest match, or suggest a feature approach where matching is not possible.',
      },
    ],
  },
];

export const GENERAL_FAQS: FaqItem[] = [
  {
    q: 'What areas do you service?',
    a: `We are based in Hansonville and regularly work across ${AREA_SUMMARY}. If you are nearby but not listed, just ask.`,
  },
  {
    q: 'Do you only do high-end jobs?',
    a: 'No. We are known for high-end work like French cut mitred edges and slab tiling, but we take on jobs of every size: small repairs, regrouting, splashbacks, laundries and everyday bathrooms all get the same care.',
  },
  {
    q: 'What is a French cut (mitred edge)?',
    a: 'A 45° bevel cut where two tiles meet at a corner, creating a seamless, trim-free edge that looks like solid stone. We are one of the few tilers in North East Victoria who specialise in it.',
  },
  {
    q: 'Are quotes free?',
    a: 'Yes. Quotes are free with no obligation. Use the online quote form (photos help) or call 0467 551 492, and we aim to respond within 24 hours.',
  },
  {
    q: 'Is your waterproofing compliant?',
    a: 'Yes. All wet-area waterproofing is installed to AS 3740, and screeding and tiling follow the relevant Australian Standards.',
  },
  {
    q: 'Do you offer a warranty?',
    a: 'Yes. Our installations are backed by a 10-year workmanship warranty.',
  },
];

export function faqJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function businessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${SITE_URL}/#business`,
    name: BUSINESS.name,
    description:
      'Specialist tiler in North East Victoria offering French cut mitred edges, large-format slab, bathroom, kitchen, pool and outdoor tiling, plus small jobs and repairs.',
    url: SITE_URL,
    logo: `${SITE_URL}${BUSINESS.logo}`,
    image: [`${SITE_URL}${BUSINESS.ogImage}`, `${SITE_URL}${BUSINESS.logo}`],
    telephone: BUSINESS.phoneIntl,
    email: BUSINESS.email,
    founder: { '@type': 'Person', name: BUSINESS.owner },
    address: { '@type': 'PostalAddress', ...BUSINESS.address },
    areaServed: [
      ...SERVICE_AREAS.map((name) => ({ '@type': 'City', name })),
      { '@type': 'AdministrativeArea', name: REGION },
    ],
    knowsAbout: [
      'French cut tiling',
      'Mitred tile edges',
      'Large-format porcelain slab tiling',
      'Bathroom waterproofing AS 3740',
      'Pool coping',
      'Herringbone tiling',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tiling Services',
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, url: `${SITE_URL}/services/${s.slug}` },
      })),
    },
    ...(BUSINESS.sameAs.length ? { sameAs: BUSINESS.sameAs } : {}),
  };
}
