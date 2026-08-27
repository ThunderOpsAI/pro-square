import { z } from 'zod';

export const QuoteInputSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Please enter a valid phone number').max(30),
  projectType: z.enum([
    'bathroom',
    'kitchen',
    'floor',
    'outdoor',
    'commercial',
    'other',
  ], {
    error: 'Please select a project type',
  }),
  message: z.string().min(10, 'Please describe your project (at least 10 characters)').max(3000),
  turnstileToken: z.string().optional(),
  source: z.string().optional(),
});

export type QuoteInput = z.infer<typeof QuoteInputSchema>;

export const CallClickSchema = z.object({
  intent: z.string().default('call_button'),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
});

export type CallClickInput = z.infer<typeof CallClickSchema>;

export const AdminLoginSchema = z.object({
  email: z.string().email('Please enter a valid admin email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST']),
});

export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;

export const BudgetTransactionTypeEnum = z.enum(['INCOME', 'EXPENSE']);
export type BudgetTransactionType = z.infer<typeof BudgetTransactionTypeEnum>;

export const CreateBudgetTransactionSchema = z.object({
  type: BudgetTransactionTypeEnum,
  category: z.string().min(1, 'Category is required').default('GENERAL'),
  amount: z.number().positive('Amount must be greater than 0'),
  gstAmount: z.number().min(0, 'GST amount cannot be negative').optional().nullable(),
  isTaxDeductible: z.boolean().optional(),
  description: z.string().min(1, 'Description is required').max(500),
  date: z.union([z.string().min(1), z.date()]).optional(),
  reference: z.string().max(100).optional().nullable(),
  paymentMethod: z.string().max(50).optional().nullable().default('BANK_TRANSFER'),
  isPersonal: z.boolean().optional().default(false),
  quoteId: z.string().min(1).optional().nullable(),
});

export type CreateBudgetTransactionInput = z.infer<typeof CreateBudgetTransactionSchema>;

export const UpdateBudgetTransactionSchema = z.object({
  type: BudgetTransactionTypeEnum.optional(),
  category: z.string().min(1).optional(),
  amount: z.number().positive('Amount must be greater than 0').optional(),
  gstAmount: z.number().min(0).optional().nullable(),
  isTaxDeductible: z.boolean().optional(),
  description: z.string().min(1).max(500).optional(),
  date: z.union([z.string().min(1), z.date()]).optional(),
  reference: z.string().max(100).optional().nullable(),
  paymentMethod: z.string().max(50).optional().nullable(),
  isPersonal: z.boolean().optional(),
  quoteId: z.string().optional().nullable(),
});

export type UpdateBudgetTransactionInput = z.infer<typeof UpdateBudgetTransactionSchema>;

export const SyncQuoteSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required'),
  action: z.enum(['WON', 'INVOICE_PAID', 'LOG_MATERIAL_EXPENSE']),
});

export type SyncQuoteInput = z.infer<typeof SyncQuoteSchema>;

// Detailed Quote & Calculator Schemas
export const QuoteStatusEnum = z.enum(['DRAFT', 'SENT', 'WON', 'LOST', 'INVOICED', 'PAID']);
export type QuoteStatusType = z.infer<typeof QuoteStatusEnum>;

export const CreateQuoteItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Item name is required'),
  category: z.string().default('MATERIAL'),
  quantity: z.number().min(0, 'Quantity cannot be negative').default(1),
  unit: z.string().default('item'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative').default(0),
  unitPrice: z.number().min(0, 'Unit price cannot be negative').default(0),
  totalCost: z.number().min(0).optional(),
  totalPrice: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
});

export type CreateQuoteItemInput = z.infer<typeof CreateQuoteItemSchema>;

export const CreateDetailedQuoteSchema = z.object({
  leadId: z.string().optional().nullable(),
  updateLeadStatus: z.boolean().optional().default(true),
  quoteNumber: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid customer email is required'),
  customerPhone: z.string().optional().nullable(),
  projectAddress: z.string().optional().nullable(),
  projectType: z.string().default('General Tiling'),
  scopeDescription: z.string().optional().nullable(),
  status: QuoteStatusEnum.optional().default('DRAFT'),

  // Tile & Area Specifications
  areaM2: z.number().min(0, 'Area cannot be negative').default(0),
  wastagePercent: z.number().min(0, 'Wastage percentage cannot be negative').default(10),
  tileLengthMm: z.number().positive('Tile length must be positive').optional().default(600),
  tileWidthMm: z.number().positive('Tile width must be positive').optional().default(600),
  tileThicknessMm: z.number().positive('Tile thickness must be positive').optional().default(10),
  groutJointMm: z.number().min(0, 'Grout joint cannot be negative').optional().default(2),
  trowelSizeMm: z.number().positive('Trowel size must be positive').optional().default(10),
  isWetArea: z.boolean().optional().default(false),

  // Financial Breakdown & Labour
  materialCost: z.number().min(0).optional(),
  labourDays: z.number().min(0).optional().default(0),
  labourDayRate: z.number().min(0).optional().default(650),
  otherCost: z.number().min(0).optional().default(0),
  markupPercent: z.number().optional(),
  profitMarginPercent: z.number().optional(),
  subtotalExGst: z.number().min(0).optional(),
  depositRequired: z.number().min(0).optional(),
  proposalTone: z.enum(['formal', 'confident', 'concise', 'detailed']).optional().default('confident'),
  notes: z.string().optional().nullable(),

  items: z.array(CreateQuoteItemSchema).optional(),
});

export type CreateDetailedQuoteInput = z.infer<typeof CreateDetailedQuoteSchema>;

export const UpdateDetailedQuoteSchema = z.object({
  leadId: z.string().optional().nullable(),
  updateLeadStatus: z.boolean().optional(),
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional().nullable(),
  projectAddress: z.string().optional().nullable(),
  projectType: z.string().optional(),
  scopeDescription: z.string().optional().nullable(),
  status: QuoteStatusEnum.optional(),

  // Tile & Area Specifications
  areaM2: z.number().min(0).optional(),
  wastagePercent: z.number().min(0).optional(),
  tileLengthMm: z.number().positive().optional().nullable(),
  tileWidthMm: z.number().positive().optional().nullable(),
  tileThicknessMm: z.number().positive().optional().nullable(),
  groutJointMm: z.number().min(0).optional().nullable(),
  trowelSizeMm: z.number().positive().optional().nullable(),
  isWetArea: z.boolean().optional(),

  // Financial Breakdown & Labour
  materialCost: z.number().min(0).optional(),
  labourDays: z.number().min(0).optional(),
  labourDayRate: z.number().min(0).optional(),
  otherCost: z.number().min(0).optional(),
  markupPercent: z.number().optional(),
  profitMarginPercent: z.number().optional(),
  subtotalExGst: z.number().min(0).optional(),
  depositRequired: z.number().min(0).optional(),
  proposalTone: z.enum(['formal', 'confident', 'concise', 'detailed']).optional(),
  proposalText: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  items: z.array(CreateQuoteItemSchema).optional(),
});

export type UpdateDetailedQuoteInput = z.infer<typeof UpdateDetailedQuoteSchema>;

export const AreaDeductionSchema = z.object({
  width: z.number().min(0),
  height: z.number().min(0),
  name: z.string().optional(),
});

export const FloorDimensionSchema = z.object({
  length: z.number().min(0),
  width: z.number().min(0),
  name: z.string().optional(),
  deductions: z.array(AreaDeductionSchema).optional(),
});

export const WallDimensionSchema = z.object({
  width: z.number().min(0),
  height: z.number().min(0),
  name: z.string().optional(),
  deductions: z.array(AreaDeductionSchema).optional(),
});

export const CalculatorCalculateSchema = z.object({
  // Area Specs
  areaM2: z.number().min(0).optional().default(0),
  wastagePercent: z.number().min(0).optional().default(10),
  floors: z.array(FloorDimensionSchema).optional(),
  walls: z.array(WallDimensionSchema).optional(),
  pattern: z.enum([
    'standard',
    'subway',
    'staggered',
    'herringbone',
    'diagonal',
    'chevron',
    'modular',
    'mosaic',
    'custom',
  ]).optional(),

  // Tile Specs
  tileLengthMm: z.number().positive().optional().default(600),
  tileWidthMm: z.number().positive().optional().default(600),
  tileThicknessMm: z.number().positive().optional().default(10),
  groutJointMm: z.number().min(0).optional().default(2),
  trowelSizeMm: z.number().positive().optional().default(10),
  isWetArea: z.boolean().optional().default(false),
  packagingPiecesPerBox: z.number().positive().optional(),
  packagingM2PerBox: z.number().positive().optional(),

  // Direct Cost inputs
  materialCost: z.number().min(0).optional().default(0),
  labourDays: z.number().min(0).optional().default(0),
  labourDayRate: z.number().min(0).optional().default(650),
  labourCost: z.number().min(0).optional(),
  subcontractorCost: z.number().min(0).optional().default(0),
  skipHireCost: z.number().min(0).optional().default(0),
  equipmentHireCost: z.number().min(0).optional().default(0),
  otherCost: z.number().min(0).optional().default(0),

  // Pricing / Margins
  markupPercent: z.number().optional(),
  profitMarginPercent: z.number().optional(),
  targetMarginPercentage: z.number().optional(),
  quotedPriceExGst: z.number().optional(),
  quotedPriceIncGst: z.number().optional(),
  gstRate: z.number().optional(),
  incomeTaxRate: z.number().optional(),
});

export type CalculatorCalculateInput = z.infer<typeof CalculatorCalculateSchema>;

export const MaterialPresetSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Preset name is required').max(100),
  adhesiveCoveragePerBag: z.number().positive('Adhesive coverage must be greater than 0').default(4.5),
  adhesiveBagCost: z.number().min(0, 'Cost cannot be negative').default(35.0),
  groutCostPerKg: z.number().min(0, 'Cost cannot be negative').default(8.0),
  siliconeCostPerTube: z.number().min(0, 'Cost cannot be negative').default(18.0),
  waterproofingCostPerLitre: z.number().min(0, 'Cost cannot be negative').default(22.0),
  defaultDayRate: z.number().min(0, 'Day rate cannot be negative').default(650.0),
  defaultWastagePercent: z.number().min(0, 'Wastage percent cannot be negative').default(10.0),
});

export type MaterialPresetInput = z.infer<typeof MaterialPresetSchema>;


