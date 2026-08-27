/**
 * Pro Square Tiling - Proposal Generator Engine
 * 
 * Professional trade proposal formatting, automated milestone payment scheduling,
 * material specification breakdowns, Australian Standards warranty terms,
 * and dual Markdown / responsive Resend HTML email generation.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ProposalTone = 'formal' | 'confident' | 'concise' | 'detailed';

export type LineItemCategory = 
  | 'preparation' 
  | 'waterproofing' 
  | 'supply' 
  | 'laying' 
  | 'grouting_sealing' 
  | 'finishing' 
  | 'disposal' 
  | 'other';

export interface ProposalLineItem {
  id?: string;
  category: LineItemCategory;
  description: string;
  quantity: number;
  unit: 'm²' | 'lm' | 'pcs' | 'room' | 'hrs' | 'fixed' | 'lot';
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface MaterialSpecifications {
  tileFormat: string;             // e.g. "600x600mm rectified porcelain" or "300x600mm ceramic"
  tileFinish?: string;            // e.g. "Honed matte", "Polished", "Terrazzo look", "Textured R10"
  substratePrep: string;          // e.g. "Self-leveling compound screed & acoustic underlayment"
  waterproofingPrep: string;      // e.g. "Class III polyurethane liquid membrane (AS 3740 & AS 4858 compliant)"
  groutSpecification: string;     // e.g. "Mapei Ultracolor Plus / Epoxy antimicrobial mold-resistant grout (1.5mm - 2mm joint)"
  edgeTrims: string;              // e.g. "45-degree hand-mitred external corners / Brushed brass anodized box trims"
  movementJointsAndSealant: string; // e.g. "Colour-matched neutral-cure sanitary silicone (AS 3958.1 expansion compliant)"
  adhesiveSpec?: string;          // e.g. "C2TES1 High-polymer flexible cementitious tile adhesive"
}

export interface PaymentMilestone {
  milestoneNumber: number;
  name: string;
  percentage: number;
  amount: number;
  triggerDescription: string;
  status?: 'pending' | 'due' | 'paid';
}

export interface PaymentSchedule {
  totalAmount: number;
  milestones: PaymentMilestone[];
  depositAmount: number;
  termsNotice: string;
}

export interface WarrantyTerms {
  workmanshipWarranty: string;
  waterproofingWarranty: string;
  complianceStandards: string[];
  productPassThrough: string;
  termsAndConditions: string[];
}

export interface ProposalAnalysis {
  requirements: string[];
  keywords: string[];
  painPoints: string[];
  detectedAreaSize?: string;
  detectedTileType?: string;
}

export interface ProposalTotals {
  subtotal: number;
  gst: number;
  discount: number;
  total: number;
  estimateLow?: number;
  estimateHigh?: number;
}

export interface ClientProposalInput {
  proposalNumber?: string;
  date?: string | Date;
  validUntil?: string | Date;
  tone?: ProposalTone;
  
  // Client Info
  client: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    suburb?: string;
  };
  
  // Project Details
  project: {
    title: string;
    projectType: 'bathroom' | 'kitchen' | 'floor' | 'outdoor' | 'commercial' | 'other' | string;
    description: string;
    estimatedDuration?: string;
    startDateTarget?: string;
  };

  // Scope & Line Items (Optional: if empty, defaults will be inferred from project details)
  lineItems?: ProposalLineItem[];
  
  // Materials & Specs (Optional: default specs will be provided based on project type)
  materialSpecs?: Partial<MaterialSpecifications>;
  
  // Custom Pricing / Estimates
  pricing?: {
    fixedTotal?: number;
    estimateLow?: number;
    estimateHigh?: number;
    discount?: number;
    applyGst?: boolean;
  };

  // Payment Schedule Override
  milestonePercentages?: {
    deposit?: number;
    commencement?: number;
    completion?: number;
  };

  // Custom notes or special clauses
  specialNotes?: string[];
  includeWarranty?: boolean;
  userProfile?: string;
}

export interface GeneratedClientProposal {
  proposalNumber: string;
  dateFormatted: string;
  validUntilFormatted: string;
  tone: ProposalTone;
  analysis: ProposalAnalysis;
  clientSummary: string;
  lineItems: ProposalLineItem[];
  materialSpecs: MaterialSpecifications;
  paymentSchedule: PaymentSchedule;
  warrantyTerms: WarrantyTerms;
  totals: ProposalTotals;
  plainText: string;
  markdown: string;
  htmlEmail: string;
}

export interface ProposalPack {
  analysis: ProposalAnalysis;
  primary: GeneratedClientProposal;
  variants: {
    tone: ProposalTone;
    pitch: string;
    plainText: string;
  }[];
}

// ============================================================================
// Business Branding Constants
// ============================================================================

export const BRANDING = {
  companyName: 'Pro Square Tiling',
  tagline: 'Master Craftsmanship &bull; Precision Installation',
  motto: 'Setting the Standard in Premium Ceramic, Porcelain & Stone Finishes',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(0400) 000-000',
  email: process.env.BUSINESS_OWNER_EMAIL || 'info@prosquaretiling.com.au',
  website: 'https://prosquaretiling.com.au',
  abn: 'XX XXX XXX XXX',
  licenseNo: 'NSW / VIC Trade Lic. #394821C',
  address: 'Sydney & Greater Metro, NSW',
  primaryColor: '#1e3a8a',    // Deep Navy
  secondaryColor: '#2563eb',  // Sapphire Blue
  accentColor: '#d97706',     // Warm Amber / Gold
  backgroundColor: '#f8fafc', // Clean Slate 50
  cardBackgroundColor: '#ffffff',
  borderColor: '#e2e8f0',
  textColor: '#0f172a',
  mutedColor: '#64748b',
};

const STOP_WORDS = new Set([
  'the', 'and', 'with', 'that', 'this', 'for', 'are', 'you', 'your', 'our',
  'from', 'have', 'will', 'need', 'looking', 'into', 'about', 'project',
  'work', 'job', 'build', 'create', 'want', 'must', 'should', 'can',
  'able', 'please', 'than', 'them', 'they', 'their', 'some', 'just', 'also',
  'been', 'were', 'what', 'when', 'where', 'which', 'who', 'how', 'all', 'any',
  'both', 'each', 'few', 'more', 'most', 'other', 'same', 'such', 'than', 'too',
]);

export const DEFAULT_TONES: ProposalTone[] = ['confident', 'formal', 'concise', 'detailed'];

// ============================================================================
// Text Analysis Helpers
// ============================================================================

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts key trade requirements from the customer inquiry.
 */
export function extractRequirements(description: string): string[] {
  const lines = description
    .split(/\n|\.|;|•|- /)
    .map(line => normalizeText(line))
    .filter(Boolean);

  const matched = lines.filter(line =>
    /need|must|require|want|install|tile|waterproof|screed|grout|demolition|renovat|replace|fix|level|shower|feature/i.test(line)
  );

  return (matched.length > 0 ? matched : lines).slice(0, 6);
}

/**
 * Extracts key domain terminology and features from the text.
 */
export function extractKeywords(description: string): string[] {
  const words = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));

  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

/**
 * Detects common client pain points and quality sensitivities.
 */
export function extractPainPoints(description: string): string[] {
  const painMap: Record<string, string> = {
    urgent: 'Urgent timeline / strict completion deadline',
    asap: 'Rapid turnaround required',
    leak: 'Water ingress / leak remediation',
    waterproofing: 'Certified watertight integrity & leak-free peace of mind',
    cracked: 'Substrate movement / tile cracking issues',
    uneven: 'Uneven or unlevel substrate correction',
    budget: 'Cost transparency & fixed-price certainty',
    quality: 'High-end aesthetic & flawless alignment',
    clean: 'Clean, tidy, and minimally disruptive workspace',
    lippage: 'Zero-lippage flat finish precision',
    mold: 'Mold prevention & stain-resistant epoxy grouting',
  };

  const lower = description.toLowerCase();
  const detected: string[] = [];

  for (const [key, label] of Object.entries(painMap)) {
    if (lower.includes(key)) {
      detected.push(label);
    }
  }

  return detected.slice(0, 4);
}

/**
 * Analyzes raw inquiry text into structured proposal insights.
 */
export function analyzeProjectInquiry(description: string): ProposalAnalysis {
  return {
    requirements: extractRequirements(description),
    keywords: extractKeywords(description),
    painPoints: extractPainPoints(description),
  };
}

// ============================================================================
// Defaults & Material Specifications
// ============================================================================

export function getDefaultMaterialSpecs(projectType: string = 'bathroom'): MaterialSpecifications {
  const normalizedType = projectType.toLowerCase();

  if (normalizedType.includes('bathroom') || normalizedType.includes('shower') || normalizedType.includes('wet')) {
    return {
      tileFormat: '600x600mm Rectified Porcelain (Floor) & 300x600mm Ceramic/Glazed Porcelain (Walls)',
      tileFinish: 'R10 Matte Anti-Slip (Floor) / Satin Semi-Gloss (Walls)',
      substratePrep: 'Mechanical grind, dust extraction, cementitious polymer primer & sand-cement bed screeding',
      waterproofingPrep: 'Class III Polyurethane / Modified SBR Liquid Membrane with non-woven bandage detailing (AS 3740 & AS 4858 Compliant)',
      groutSpecification: 'Mapei Ultracolor Plus / Epoxy anti-efflorescence mold-resistant grout (1.5mm - 2mm joint)',
      edgeTrims: 'Precision 45-degree hand-mitred corners with epoxy resin backing or anodised square-edge trims',
      movementJointsAndSealant: 'Colour-matched anti-fungal sanitary 100% neutral-cure silicone around perimeter and internal junctions',
      adhesiveSpec: 'C2TES1 Premium High-polymer flexible non-slump cementitious adhesive',
    };
  }

  if (normalizedType.includes('kitchen') || normalizedType.includes('splash') || normalizedType.includes('backsplash')) {
    return {
      tileFormat: '100x300mm Glazed Subway / Handmade Zellige or 600x1200mm Large Format Porcelain',
      tileFinish: 'High-Gloss / Handcrafted Satin Glaze',
      substratePrep: 'Surface de-greasing, plumb check, fiber-cement backer board inspection and bonding primer',
      waterproofingPrep: 'Moisture barrier primer behind benchtop splash zone and sink perimeter',
      groutSpecification: 'Stain-resistant antibacterial fine joint grout (1.5mm joint)',
      edgeTrims: 'Polished or Brushed brass/black architectural edge profile trims',
      movementJointsAndSealant: 'Food-grade mold-resistant neutral silicone at benchtop junction',
      adhesiveSpec: 'D2TE High-bond dispersion paste or C2TE polymer-modified adhesive',
    };
  }

  if (normalizedType.includes('outdoor') || normalizedType.includes('balcony') || normalizedType.includes('pool') || normalizedType.includes('patio')) {
    return {
      tileFormat: '600x600x20mm Structural Porcelain Pavers or Travertine / Bluestone',
      tileFinish: 'R11 / P4 High Slip-Resistant Textured Exterior Finish',
      substratePrep: 'Structural slab high-pressure wash, crack bridging & fall-to-waste screed (1:80 min gradient)',
      waterproofingPrep: 'External UV-stable Class III dual-layer waterproofing membrane system with certified bond breakers',
      groutSpecification: 'Heavy-duty weather-resistant & UV-stable exterior polymer modified grout',
      edgeTrims: 'Drop-face rebated step coping / Brushed 316 marine-grade stainless trims',
      movementJointsAndSealant: 'Trafficable polyurethane exterior expansion joint sealant (AS 3958.1 spacing)',
      adhesiveSpec: 'C2S2 Ultra-flexible high-strength exterior rubber modified adhesive',
    };
  }

  // General Floor / Living / Commercial
  return {
    tileFormat: '600x600mm / 600x1200mm Rectified Porcelain Tiles',
    tileFinish: 'Honed Matte or Polished Porcelain',
    substratePrep: 'Self-leveling compound underlayment (floor flatness tolerance ≤ 2mm per 2m straight edge)',
    waterproofingPrep: 'Moisture barrier epoxy primer for slab vapor control if required',
    groutSpecification: 'Efflorescence-free polymer-modified fine finish grout (1.5mm joint width)',
    edgeTrims: 'Transition reducer trims to timber/carpet and clean perimeter threshold profiles',
    movementJointsAndSealant: 'Perimeter expansion joints with matching neutral-cure elastic silicone',
    adhesiveSpec: 'C2TES1 Premium polymer modified flexible floor tile adhesive',
  };
}

export function getDefaultWarrantyTerms(): WarrantyTerms {
  return {
    workmanshipWarranty: '10-Year Master Workmanship Guarantee against installation defects, delamination, and lippage.',
    waterproofingWarranty: '7-Year Certified Waterproofing Guarantee compliant with AS 3740 & AS 4858 with form-4 compliance certificate.',
    complianceStandards: [
      'AS 3958.1-2007: Ceramic Tiles - Guide to the installation of ceramic tiles',
      'AS 3740-2021: Waterproofing of domestic wet areas',
      'AS 4586-2013: Slip resistance classification of new pedestrian surface materials',
    ],
    productPassThrough: 'Manufacturer warranty on adhesives, grouts, and waterproofing membranes passes directly to the client (up to 15-25 years).',
    termsAndConditions: [
      'Quote valid for 30 calendar days from issue date.',
      'Includes complete site protection, surface dust suppression, and comprehensive final post-tiling clean.',
      'Tiles and decorative stone to be supplied by client unless itemized as contractor supply.',
      'Variation requests are documented and approved prior to commencement.',
    ],
  };
}

// ============================================================================
// Payment Schedule Generation
// ============================================================================

/**
 * Generates a structured trade milestone payment schedule.
 * Standard Master Trade Breakdown:
 * - Milestone 1: 10% Booking Deposit & Material Allocation
 * - Milestone 2: 40% Surface Prep, Waterproofing & Commencement
 * - Milestone 3: 50% Practical Completion & Final Sign-Off
 */
export function generatePaymentSchedule(
  totalAmount: number,
  customPercentages?: { deposit?: number; commencement?: number; completion?: number }
): PaymentSchedule {
  const safeTotal = Math.max(0, totalAmount);
  
  const depPct = customPercentages?.deposit ?? 10;
  const commPct = customPercentages?.commencement ?? 40;
  const compPct = customPercentages?.completion ?? (100 - depPct - commPct);

  const depAmount = Math.round((safeTotal * depPct) / 100);
  const commAmount = Math.round((safeTotal * commPct) / 100);
  const compAmount = safeTotal - depAmount - commAmount; // Clean balance to eliminate rounding discrepancy

  const milestones: PaymentMilestone[] = [
    {
      milestoneNumber: 1,
      name: 'Initial Booking & Material Allocation Deposit',
      percentage: depPct,
      amount: depAmount,
      triggerDescription: 'Upon proposal acceptance to lock in start dates and allocate specialty trade equipment & materials.',
      status: 'pending',
    },
    {
      milestoneNumber: 2,
      name: 'Substrate Prep, Waterproofing & Laying Commencement',
      percentage: commPct,
      amount: commAmount,
      triggerDescription: 'Upon completion of mechanical surface prep, AS 3740 waterproofing certification, and commencement of tile installation.',
      status: 'pending',
    },
    {
      milestoneNumber: 3,
      name: 'Practical Completion, Grout Polish & Final Handover',
      percentage: compPct,
      amount: compAmount,
      triggerDescription: 'Upon 100% completion of tile laying, grouting, silicone sealing, detailed acid/polish clean, and client sign-off.',
      status: 'pending',
    },
  ];

  return {
    totalAmount: safeTotal,
    milestones,
    depositAmount: depAmount,
    termsNotice: 'Payment terms: Direct Electronic Funds Transfer (EFT). Invoices issued per milestone with 3-day payment terms.',
  };
}

// ============================================================================
// Totals Calculation
// ============================================================================

export function calculateProposalTotals(
  lineItems: ProposalLineItem[],
  options?: {
    discount?: number;
    applyGst?: boolean;
    estimateLow?: number;
    estimateHigh?: number;
    fixedTotal?: number;
  }
): ProposalTotals {
  let subtotal = 0;

  if (options?.fixedTotal !== undefined && options.fixedTotal > 0) {
    subtotal = options.fixedTotal;
  } else if (lineItems.length > 0) {
    subtotal = lineItems.reduce((acc, item) => acc + (item.totalPrice || item.quantity * item.unitPrice), 0);
  } else if (options?.estimateLow && options?.estimateHigh) {
    subtotal = Math.round((options.estimateLow + options.estimateHigh) / 2);
  }

  const discount = Math.max(0, options?.discount || 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const applyGst = options?.applyGst ?? true;
  const gst = applyGst ? Math.round(discountedSubtotal * 0.10) : 0;
  const total = discountedSubtotal + gst;

  return {
    subtotal,
    discount,
    gst,
    total,
    estimateLow: options?.estimateLow,
    estimateHigh: options?.estimateHigh,
  };
}

// ============================================================================
// Default Itemization Generator
// ============================================================================

function generateDefaultLineItems(projectType: string, description: string): ProposalLineItem[] {
  const normType = projectType.toLowerCase();
  const lowerDesc = description.toLowerCase();

  const items: ProposalLineItem[] = [];

  // Item 1: Prep
  items.push({
    category: 'preparation',
    description: 'Substrate mechanical grinding, surface levelling, vacuum dust extraction & specialized priming',
    quantity: 1,
    unit: 'lot',
    unitPrice: 480,
    totalPrice: 480,
    notes: 'Ensures optimal mechanical key & prevents hollows',
  });

  // Item 2: Waterproofing (if wet area or general)
  if (normType.includes('bathroom') || normType.includes('shower') || normType.includes('outdoor') || lowerDesc.includes('waterproof')) {
    items.push({
      category: 'waterproofing',
      description: 'Dual-coat AS 3740 Class III polyurethane membrane application with bonded elastic reinforcement bandages',
      quantity: 1,
      unit: 'lot',
      unitPrice: 650,
      totalPrice: 650,
      notes: 'Includes full wet area compliance sign-off',
    });
  }

  // Item 3: Tile Installation
  if (normType.includes('bathroom')) {
    items.push({
      category: 'laying',
      description: 'Precision laying of wall & floor tiles, laser-levelled layout, niche framing & shower base fall setting',
      quantity: 24,
      unit: 'm²',
      unitPrice: 85,
      totalPrice: 2040,
      notes: 'Laser calibrated for uniform grout lines & zero-lippage',
    });
  } else if (normType.includes('kitchen') || normType.includes('splash')) {
    items.push({
      category: 'laying',
      description: 'Feature kitchen splashback tile laying, detailed power point cut-outs & perimeter alignment',
      quantity: 6,
      unit: 'm²',
      unitPrice: 110,
      totalPrice: 660,
      notes: 'Architectural symmetry aligned with cabinetry',
    });
  } else if (normType.includes('outdoor')) {
    items.push({
      category: 'laying',
      description: 'Outdoor porcelain paver / stone installation with falls to drain and expansion joints',
      quantity: 35,
      unit: 'm²',
      unitPrice: 95,
      totalPrice: 3325,
      notes: 'C2S2 rubber-modified high-flex adhesive',
    });
  } else {
    items.push({
      category: 'laying',
      description: 'Main floor tile installation with mechanical lippage leveling clip system',
      quantity: 45,
      unit: 'm²',
      unitPrice: 75,
      totalPrice: 3375,
      notes: 'Even planar finish with minimum joint width',
    });
  }

  // Item 4: Grouting & Silicone
  items.push({
    category: 'grouting_sealing',
    description: 'Antimicrobial mold-resistant grouting & colour-matched 100% sanitary neutral silicone perimeter expansion joints',
    quantity: 1,
    unit: 'lot',
    unitPrice: 380,
    totalPrice: 380,
    notes: 'Premium Mapei / Laticrete flexible compounds',
  });

  // Item 5: Finishing & Clean
  items.push({
    category: 'finishing',
    description: 'Post-installation haze buffing, acid clean, silicone inspection & complete site clean-up',
    quantity: 1,
    unit: 'lot',
    unitPrice: 220,
    totalPrice: 220,
    notes: 'Turnkey ready-for-use presentation',
  });

  return items;
}

// ============================================================================
// Proposal Intros and Pitch by Tone
// ============================================================================

function getToneCopy(tone: ProposalTone, clientName: string, projectTitle: string): { intro: string; closing: string; pitch: string } {
  const firstName = clientName.split(' ')[0] || 'valued client';

  switch (tone) {
    case 'formal':
      return {
        intro: `Dear ${firstName}, thank you for providing the opportunity to tender for your ${projectTitle}. Pro Square Tiling is pleased to present this comprehensive trade proposal, detailed material specifications, and quality guarantees tailored to your property.`,
        closing: `We are committed to delivering exemplary craftsmanship and adherence to Australian Building Standards. Please review the proposal details below, and do not hesitate to contact our team should you require any clarifications or adjustments.`,
        pitch: `A meticulously engineered trade solution adhering strictly to AS 3958.1 & AS 3740 standards, providing uncompromising aesthetic perfection and structural longevity.`,
      };

    case 'concise':
      return {
        intro: `Hi ${firstName}, here is your detailed, fixed-price proposal for the ${projectTitle}. Everything is itemized transparently below so you know exactly what is included.`,
        closing: `Ready to commence on your requested timeline. Simply reply to accept this proposal or let us know if you would like to adjust the schedule.`,
        pitch: `Fast, transparent, and hassle-free tiling executed to master trade standards with clear milestone pricing.`,
      };

    case 'detailed':
      return {
        intro: `Dear ${firstName}, thank you for entrusting Pro Square Tiling with the planning for your upcoming ${projectTitle}. Below is our exhaustive trade scope of works, covering mechanical substrate engineering, certified waterproofing barriers, precision tile installation, and warranty specifications.`,
        closing: `Our master tilers oversee every square meter with millimeter precision. We welcome the opportunity to transform your space with the highest level of craftsmanship available in the trade.`,
        pitch: `An end-to-end architectural tiling execution focusing on substrate levelling, membrane integrity, precise mitred corner details, and lifetime durability.`,
      };

    case 'confident':
    default:
      return {
        intro: `Hi ${firstName}, thank you for reaching out to Pro Square Tiling regarding your ${projectTitle}. We have structured a premium, reliable proposal designed to deliver a flawless, high-durability finish with zero hassle.`,
        closing: `We take immense pride in delivering crisp lines, flat planes, and watertight peace of mind. We look forward to partnering with you on this project.`,
        pitch: `Premium craftsmanship, laser-accurate alignment, and certified waterproofing backed by our 10-year workmanship guarantee.`,
      };
  }
}

// ============================================================================
// Proposal Generator Main Engine
// ============================================================================

/**
 * Builds the complete unified proposal object containing all computed values,
 * analysis, payment milestones, markdown and Resend-ready HTML.
 */
export function generateCompleteProposal(input: ClientProposalInput): GeneratedClientProposal {
  const proposalNumber = input.proposalNumber || `PST-${Date.now().toString().slice(-6)}`;
  const dateObj = input.date ? new Date(input.date) : new Date();
  const validUntilObj = input.validUntil ? new Date(input.validUntil) : new Date(dateObj.getTime() + 30 * 24 * 60 * 60 * 1000);

  const dateFormatted = dateObj.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  const validUntilFormatted = validUntilObj.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

  const tone: ProposalTone = input.tone && DEFAULT_TONES.includes(input.tone) ? input.tone : 'confident';
  const analysis = analyzeProjectInquiry(input.project.description);

  // Line items
  const lineItems: ProposalLineItem[] = (input.lineItems && input.lineItems.length > 0)
    ? input.lineItems
    : generateDefaultLineItems(input.project.projectType, input.project.description);

  // Totals
  const totals = calculateProposalTotals(lineItems, {
    discount: input.pricing?.discount,
    applyGst: input.pricing?.applyGst,
    estimateLow: input.pricing?.estimateLow,
    estimateHigh: input.pricing?.estimateHigh,
    fixedTotal: input.pricing?.fixedTotal,
  });

  // Material specs
  const defaultSpecs = getDefaultMaterialSpecs(input.project.projectType);
  const materialSpecs: MaterialSpecifications = {
    ...defaultSpecs,
    ...input.materialSpecs,
  };

  // Payment schedule
  const paymentSchedule = generatePaymentSchedule(totals.total, input.milestonePercentages);

  // Warranty
  const warrantyTerms = getDefaultWarrantyTerms();

  // Plain Text & Markdown
  const markdown = generateClientProposalText({
    ...input,
    proposalNumber,
    lineItems,
    materialSpecs,
  });

  const plainText = markdown
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*\*/g, '')
    .replace(/\|/g, ' ')
    .replace(/---/g, '----------------------------------------');

  // Resend HTML Email
  const htmlEmail = generateClientProposalHtml({
    ...input,
    proposalNumber,
    lineItems,
    materialSpecs,
  });

  const toneCopy = getToneCopy(tone, input.client.name, input.project.title);

  return {
    proposalNumber,
    dateFormatted,
    validUntilFormatted,
    tone,
    analysis,
    clientSummary: toneCopy.intro,
    lineItems,
    materialSpecs,
    paymentSchedule,
    warrantyTerms,
    totals,
    plainText,
    markdown,
    htmlEmail,
  };
}

// ============================================================================
// Markdown / Plain Text Generator
// ============================================================================

export function generateClientProposalText(input: ClientProposalInput): string {
  const proposalNumber = input.proposalNumber || `PST-${Date.now().toString().slice(-6)}`;
  const dateStr = input.date ? new Date(input.date).toLocaleDateString('en-AU') : new Date().toLocaleDateString('en-AU');
  const validUntilStr = input.validUntil ? new Date(input.validUntil).toLocaleDateString('en-AU') : new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-AU');

  const tone: ProposalTone = input.tone || 'confident';
  const toneCopy = getToneCopy(tone, input.client.name, input.project.title);

  const lineItems = (input.lineItems && input.lineItems.length > 0)
    ? input.lineItems
    : generateDefaultLineItems(input.project.projectType, input.project.description);

  const totals = calculateProposalTotals(lineItems, {
    discount: input.pricing?.discount,
    applyGst: input.pricing?.applyGst,
    estimateLow: input.pricing?.estimateLow,
    estimateHigh: input.pricing?.estimateHigh,
    fixedTotal: input.pricing?.fixedTotal,
  });

  const defaultSpecs = getDefaultMaterialSpecs(input.project.projectType);
  const specs: MaterialSpecifications = { ...defaultSpecs, ...input.materialSpecs };
  const schedule = generatePaymentSchedule(totals.total, input.milestonePercentages);
  const warranty = getDefaultWarrantyTerms();

  const lines: string[] = [];

  // Header
  lines.push(`================================================================================`);
  lines.push(`               ${BRANDING.companyName.toUpperCase()} - OFFICIAL TRADE PROPOSAL               `);
  lines.push(`               ${BRANDING.tagline.replace('&bull;', '•')}               `);
  lines.push(`================================================================================`);
  lines.push(``);
  lines.push(`PROPOSAL REF  : ${proposalNumber}`);
  lines.push(`DATE ISSUED   : ${dateStr}`);
  lines.push(`VALID UNTIL   : ${validUntilStr}`);
  lines.push(`CONTRACTOR    : ${BRANDING.companyName} (${BRANDING.licenseNo})`);
  lines.push(`CONTACT       : ${BRANDING.phone} | ${BRANDING.email}`);
  lines.push(`CLIENT        : ${input.client.name} (${input.client.email}${input.client.phone ? ` | ${input.client.phone}` : ''})`);
  if (input.client.address || input.client.suburb) {
    lines.push(`SITE LOCATION : ${[input.client.address, input.client.suburb].filter(Boolean).join(', ')}`);
  }
  lines.push(``);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`1. EXECUTIVE SCOPE SUMMARY`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`PROJECT: ${input.project.title.toUpperCase()}`);
  lines.push(``);
  lines.push(toneCopy.intro);
  lines.push(``);
  lines.push(`Project Details:`);
  lines.push(`- Scope Type: ${input.project.projectType}`);
  if (input.project.estimatedDuration) {
    lines.push(`- Estimated Duration: ${input.project.estimatedDuration}`);
  }
  if (input.project.startDateTarget) {
    lines.push(`- Target Start: ${input.project.startDateTarget}`);
  }
  lines.push(`- Key Objectives: ${input.project.description}`);
  lines.push(``);

  // Line Item Table
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`2. ITEMIZED TRADE SCOPE OF WORKS`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`No.  Description                                      Qty    Unit    Amount (AUD)`);
  lines.push(`---  ----------------------------------------------  -----  ------  -------------`);

  lineItems.forEach((item, index) => {
    const num = (index + 1).toString().padEnd(3, ' ');
    const desc = item.description.length > 46 ? `${item.description.slice(0, 43)}...` : item.description.padEnd(46, ' ');
    const qty = item.quantity.toString().padStart(5, ' ');
    const unit = item.unit.padEnd(6, ' ');
    const total = `$${item.totalPrice.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.padStart(13, ' ');
    lines.push(`${num}  ${desc}  ${qty}  ${unit}  ${total}`);
  });

  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`SUBTOTAL:                                                           $${totals.subtotal.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);
  if (totals.discount > 0) {
    lines.push(`DISCOUNT:                                                          -$${totals.discount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);
  }
  lines.push(`GST (10%):                                                          $${totals.gst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);
  lines.push(`TOTAL FIXED PRICE (INCL. GST):                                      $${totals.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);
  if (totals.estimateLow && totals.estimateHigh) {
    lines.push(`(Ballpark Range: $${totals.estimateLow.toLocaleString()} - $${totals.estimateHigh.toLocaleString()} AUD)`);
  }
  lines.push(``);

  // Material Specs
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`3. MATERIAL & INSTALLATION SPECIFICATIONS`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`- Tile Format & Dimensions : ${specs.tileFormat}`);
  if (specs.tileFinish) {
    lines.push(`- Surface Slip & Finish    : ${specs.tileFinish}`);
  }
  lines.push(`- Substrate Preparation    : ${specs.substratePrep}`);
  lines.push(`- Waterproofing Membrane   : ${specs.waterproofingPrep}`);
  lines.push(`- Grout & Joint Spec       : ${specs.groutSpecification}`);
  lines.push(`- External Corner Trims    : ${specs.edgeTrims}`);
  lines.push(`- Movement Joints & Silicone: ${specs.movementJointsAndSealant}`);
  if (specs.adhesiveSpec) {
    lines.push(`- Adhesive System          : ${specs.adhesiveSpec}`);
  }
  lines.push(``);

  // Milestone Payment Schedule
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`4. PROGRESSIVE MILESTONE PAYMENT SCHEDULE`);
  lines.push(`--------------------------------------------------------------------------------`);
  schedule.milestones.forEach((m) => {
    lines.push(`Milestone ${m.milestoneNumber}: ${m.name} (${m.percentage}%)`);
    lines.push(`Amount : $${m.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD`);
    lines.push(`Trigger: ${m.triggerDescription}`);
    lines.push(``);
  });
  lines.push(`Terms: ${schedule.termsNotice}`);
  lines.push(``);

  // Warranty Terms
  if (input.includeWarranty !== false) {
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`5. WARRANTY & QUALITY ASSURANCE STANDARDS`);
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`- Workmanship Guarantee    : ${warranty.workmanshipWarranty}`);
    lines.push(`- Waterproofing Warranty   : ${warranty.waterproofingWarranty}`);
    lines.push(`- Compliance Standards     : ${warranty.complianceStandards.join('; ')}`);
    lines.push(`- Product Pass-Through     : ${warranty.productPassThrough}`);
    lines.push(``);
  }

  // Next Steps / CTA
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`6. HOW TO ACCEPT THIS PROPOSAL`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(toneCopy.closing);
  lines.push(``);
  lines.push(`To approve and secure your commencement date, reply directly to this document`);
  lines.push(`or call us at ${BRANDING.phone}.`);
  lines.push(``);
  lines.push(`Thank you for choosing ${BRANDING.companyName}.`);
  lines.push(`================================================================================`);

  return lines.join('\n');
}

// ============================================================================
// Resend-Ready Responsive HTML Email Generator
// ============================================================================

export function generateClientProposalHtml(input: ClientProposalInput): string {
  const proposalNumber = input.proposalNumber || `PST-${Date.now().toString().slice(-6)}`;
  const dateStr = input.date ? new Date(input.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  const validUntilStr = input.validUntil ? new Date(input.validUntil).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

  const tone: ProposalTone = input.tone || 'confident';
  const toneCopy = getToneCopy(tone, input.client.name, input.project.title);

  const lineItems = (input.lineItems && input.lineItems.length > 0)
    ? input.lineItems
    : generateDefaultLineItems(input.project.projectType, input.project.description);

  const totals = calculateProposalTotals(lineItems, {
    discount: input.pricing?.discount,
    applyGst: input.pricing?.applyGst,
    estimateLow: input.pricing?.estimateLow,
    estimateHigh: input.pricing?.estimateHigh,
    fixedTotal: input.pricing?.fixedTotal,
  });

  const defaultSpecs = getDefaultMaterialSpecs(input.project.projectType);
  const specs: MaterialSpecifications = { ...defaultSpecs, ...input.materialSpecs };
  const schedule = generatePaymentSchedule(totals.total, input.milestonePercentages);
  const warranty = getDefaultWarrantyTerms();

  const formattedTotal = `$${totals.total.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedSubtotal = `$${totals.subtotal.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedGst = `$${totals.gst.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const lineItemRows = lineItems.map((item, idx) => `
    <tr style="border-bottom: 1px solid #f1f5f9; ${idx % 2 === 1 ? 'background-color: #fafbfd;' : ''}">
      <td style="padding: 12px 14px; font-size: 13px; color: #0f172a; font-weight: 500;">
        ${item.description}
        ${item.notes ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.notes}</div>` : ''}
      </td>
      <td style="padding: 12px 10px; font-size: 13px; color: #475569; text-align: center; white-space: nowrap;">
        ${item.quantity} ${item.unit}
      </td>
      <td style="padding: 12px 10px; font-size: 13px; color: #475569; text-align: right; white-space: nowrap;">
        $${item.unitPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
      </td>
      <td style="padding: 12px 14px; font-size: 13px; font-weight: 600; color: #0f172a; text-align: right; white-space: nowrap;">
        $${item.totalPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
      </td>
    </tr>
  `).join('');

  const milestoneCards = schedule.milestones.map(m => `
    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; border-left: 4px solid #2563eb;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 13px; font-weight: 700; color: #1e3a8a;">
          Milestone ${m.milestoneNumber}: ${m.name}
        </span>
        <span style="background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
          ${m.percentage}% &bull; $${m.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
        </span>
      </div>
      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.4;">
        ${m.triggerDescription}
      </p>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trade Proposal - ${input.project.title} | ${BRANDING.companyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 32px 30px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 0;">
                      ${BRANDING.companyName}
                    </div>
                    <div style="font-size: 12px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: 4px;">
                      Master Craftsmanship &bull; Precision Installation
                    </div>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); color: #ffffff; font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 20px; white-space: nowrap;">
                      Ref: ${proposalNumber}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Summary Bar -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 14px 30px; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 12px; color: #475569;">
                <tr>
                  <td style="padding: 2px 0;"><strong>Date:</strong> ${dateStr}</td>
                  <td style="padding: 2px 0; text-align: center;"><strong>Valid Until:</strong> ${validUntilStr}</td>
                  <td style="padding: 2px 0; text-align: right;"><strong>License:</strong> ${BRANDING.licenseNo}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 30px;">
              
              <!-- Greeting & Pitch -->
              <h2 style="font-size: 18px; color: #1e3a8a; margin: 0 0 10px 0; font-weight: 700;">
                Trade Proposal: ${input.project.title}
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                ${toneCopy.intro}
              </p>

              <!-- Scope Info Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
                  Project Overview
                </h4>
                <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
                  <strong>Client:</strong> ${input.client.name} &bull; <strong>Project Type:</strong> <span style="text-transform: capitalize;">${input.project.projectType}</span>
                </p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">
                  <strong>Scope Notes:</strong> ${input.project.description}
                </p>
              </div>

              <!-- Itemized Works Table -->
              <h3 style="font-size: 15px; color: #1e3a8a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Itemized Trade Scope of Works
              </h3>
              
              <div style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                      <th style="padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Description</th>
                      <th style="padding: 10px 10px; text-align: center; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Qty</th>
                      <th style="padding: 10px 10px; text-align: right; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Rate</th>
                      <th style="padding: 10px 14px; text-align: right; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${lineItemRows}
                  </tbody>
                  <tfoot>
                    <tr style="background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                      <td colspan="3" style="padding: 8px 14px; font-size: 12px; color: #64748b; text-align: right;">Subtotal:</td>
                      <td style="padding: 8px 14px; font-size: 12px; color: #0f172a; text-align: right; font-weight: 600;">${formattedSubtotal}</td>
                    </tr>
                    ${totals.discount > 0 ? `
                    <tr style="background-color: #f8fafc;">
                      <td colspan="3" style="padding: 4px 14px; font-size: 12px; color: #16a34a; text-align: right;">Special Discount:</td>
                      <td style="padding: 4px 14px; font-size: 12px; color: #16a34a; text-align: right; font-weight: 600;">-$${totals.discount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    ` : ''}
                    <tr style="background-color: #f8fafc;">
                      <td colspan="3" style="padding: 4px 14px; font-size: 12px; color: #64748b; text-align: right;">GST (10%):</td>
                      <td style="padding: 4px 14px; font-size: 12px; color: #0f172a; text-align: right; font-weight: 600;">${formattedGst}</td>
                    </tr>
                    <tr style="background-color: #eff6ff; border-top: 2px solid #bfdbfe;">
                      <td colspan="3" style="padding: 12px 14px; font-size: 14px; color: #1e3a8a; text-align: right; font-weight: 700;">Total Fixed Price (Inc. GST):</td>
                      <td style="padding: 12px 14px; font-size: 16px; color: #1d4ed8; text-align: right; font-weight: 800;">${formattedTotal}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Material Specifications Box -->
              <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <h4 style="margin: 0 0 12px 0; font-size: 13px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center;">
                  🔍 Material & Installation Specifications
                </h4>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 12px; line-height: 1.6;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; width: 140px; vertical-align: top;">Tile Format:</td>
                    <td style="padding: 4px 0; color: #0f172a; font-weight: 500;">${specs.tileFormat}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Waterproofing:</td>
                    <td style="padding: 4px 0; color: #0f172a; font-weight: 500;">${specs.waterproofingPrep}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Substrate Prep:</td>
                    <td style="padding: 4px 0; color: #0f172a; font-weight: 500;">${specs.substratePrep}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Grouting:</td>
                    <td style="padding: 4px 0; color: #0f172a; font-weight: 500;">${specs.groutSpecification}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Trims & Edges:</td>
                    <td style="padding: 4px 0; color: #0f172a; font-weight: 500;">${specs.edgeTrims}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Expansion & Sealant:</td>
                    <td style="padding: 4px 0; color: #0f172a; font-weight: 500;">${specs.movementJointsAndSealant}</td>
                  </tr>
                </table>
              </div>

              <!-- Milestone Payment Schedule -->
              <h3 style="font-size: 15px; color: #1e3a8a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                💳 Progressive Milestone Schedule
              </h3>
              ${milestoneCards}
              <p style="font-size: 11px; color: #94a3b8; margin: 6px 0 24px 0;">
                ${schedule.termsNotice}
              </p>

              <!-- Warranty & Standards Box -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 18px; margin-bottom: 28px;">
                <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #166534; font-weight: 700;">
                  🛡️ Master Warranty & Quality Guarantee
                </h4>
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #15803d;">
                  <strong>Workmanship:</strong> ${warranty.workmanshipWarranty}
                </p>
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #15803d;">
                  <strong>Waterproofing:</strong> ${warranty.waterproofingWarranty}
                </p>
                <p style="margin: 0; font-size: 11px; color: #166534;">
                  Compliant with ${warranty.complianceStandards.join(' & ')}
                </p>
              </div>

              <!-- Call to Action -->
              <div style="text-align: center; padding: 12px 0 20px 0;">
                <a href="mailto:${BRANDING.email}?subject=${encodeURIComponent(`Accepting Proposal ${proposalNumber} - ${input.client.name}`)}&body=${encodeURIComponent(`Hi Pro Square Tiling,\n\nI accept Proposal ${proposalNumber} for ${input.project.title} ($${totals.total.toLocaleString()} AUD).\nPlease contact me to confirm start dates and deposit invoice.\n\nRegards,\n${input.client.name}`)}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                  Accept Proposal & Secure Dates &rarr;
                </a>
                <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">
                  Or reply to this email / call our master tiler directly at <strong style="color: #0f172a;">${BRANDING.phone}</strong>
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0 0 4px 0; font-weight: 700; color: #1e3a8a; font-size: 13px;">
                ${BRANDING.companyName}
              </p>
              <p style="margin: 0 0 6px 0;">
                ${BRANDING.motto}
              </p>
              <p style="margin: 0; font-size: 11px;">
                ${BRANDING.licenseNo} &bull; ${BRANDING.address} &bull; ${BRANDING.website}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================================================
// Multi-Tone Proposal Pack Generator (Compatible with ProposalBuilder Engine)
// ============================================================================

export function generateProposalPack(input: ClientProposalInput): ProposalPack {
  const primaryProposal = generateCompleteProposal(input);
  const selectedTone = primaryProposal.tone;
  const otherTones = DEFAULT_TONES.filter(t => t !== selectedTone);

  const variants = otherTones.map(tone => {
    const variantProposal = generateCompleteProposal({
      ...input,
      tone,
    });
    const toneCopy = getToneCopy(tone, input.client.name, input.project.title);

    return {
      tone,
      pitch: toneCopy.pitch,
      plainText: variantProposal.plainText,
    };
  });

  return {
    analysis: primaryProposal.analysis,
    primary: primaryProposal,
    variants,
  };
}
