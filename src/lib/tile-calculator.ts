/**
 * Trade Tile Calculator Engine
 * Standard formulas and specifications aligned with Australian Tiling & Waterproofing Standards (AS 3958.1 & AS 3740).
 */

// ==========================================
// 1. CONSTANTS & TRADE DEFAULTS
// ==========================================

export const AU_TRADE_DEFAULTS = {
  /** Default wastage percentages based on laying pattern */
  WASTAGE_PERCENTAGES: {
    standard: 10, // Stack bond / Grid (+10%)
    subway: 10, // 50% Brick bond / Running bond (+10%)
    staggered: 12, // 1/3 or 1/4 Staggered bond (+12%)
    herringbone: 15, // 90° or 45° Herringbone (+15%)
    diagonal: 15, // 45° Diagonal grid (+15%)
    chevron: 15, // Chevron pattern (+15%)
    modular: 15, // French pattern / Opus / Multi-size (+15%)
    mosaic: 15, // Sheeted mosaics with perimeter cuts (+15%)
    custom: 10,
  } as const,

  /** Adhesive (Glue) 20kg Bag Coverage by Trowel Notch Size */
  ADHESIVE_COVERAGE: {
    '6mm': { m2PerBag: 5.5, kgPerM2: 3.64, description: '6mm notch - small wall tiles up to 200x200mm' },
    '8mm': { m2PerBag: 5.0, kgPerM2: 4.0, description: '8mm notch - medium tiles up to 300x300mm' },
    '10mm': { m2PerBag: 4.5, kgPerM2: 4.44, description: '10mm notch - general floor/wall up to 600x600mm' },
    '12mm': { m2PerBag: 3.5, kgPerM2: 5.71, description: '12mm / clip notch - large format >600mm, back buttering' },
    '15mm': { m2PerBag: 3.0, kgPerM2: 6.67, description: '15mm notch - large format/uneven substrate' },
  } as const,

  /** Default Standard Grout Properties */
  GROUT: {
    cementitiousDensity: 1.6, // kg/dm³ (g/cm³) standard dry/wet blended cement grout
    epoxyDensity: 1.55, // kg/dm³ for reactive resin / epoxy grout
    wasteFactor: 1.15, // +15% industry allowance for washing off, joint compaction & bucket residue
    defaultJointWidthMm: 2.0, // 1.5mm - 3mm for rectified porcelain
    defaultThicknessMm: 10.0, // Standard porcelain tile thickness
  } as const,

  /** Australian Wet Area Waterproofing (AS 3740 / AS 4858 Class III) */
  WATERPROOFING: {
    primerCoverageM2PerLitre: 7.0, // ~7 m² per litre
    membraneLitresPerM2TwoCoats: 1.5, // 1.5 L/m² for min 1.0mm - 1.2mm dry film thickness (2 coats)
    bondBreakerRollLengthM: 50.0, // 50m reinforcing bandage tape rolls
    primerDrumSizes: [4, 15] as const, // Standard AU container sizes (L)
    membraneDrumSizes: [15] as const, // Standard AU waterproofing pail (15L)
  } as const,

  /** Perimeter & Expansion Silicone */
  SILICONE: {
    linearMetresPer300mlTube: 3.0, // ~3.0 - 3.5m of 6x6mm triangular fillet bead per 300g/310ml cartridge
    tubeVolumeMl: 300,
  } as const,

  /** Levelling Clips & Reusable Wedges */
  LEVELLING_SYSTEM: {
    clipSpacingMm: 250, // Standard clip spacing along tile edges (mm)
    standardPackSizes: [100, 250, 500, 1000] as const,
  } as const,

  /** Standard Packaging Units */
  PACKAGING: {
    adhesiveBagKg: 20,
    groutBagSizesKg: [2, 5, 20] as const,
  } as const,
};

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================

export type LayingPattern = keyof typeof AU_TRADE_DEFAULTS.WASTAGE_PERCENTAGES;
export type TrowelNotchSize = keyof typeof AU_TRADE_DEFAULTS.ADHESIVE_COVERAGE;
export type GroutType = 'cementitious' | 'epoxy' | 'fine';

export interface AreaDeduction {
  width: number;
  height: number;
  name?: string;
}

export interface WallDimensionInput {
  width: number;
  height: number;
  name?: string;
  deductions?: AreaDeduction[];
}

export interface FloorDimensionInput {
  length: number;
  width: number;
  name?: string;
  deductions?: AreaDeduction[];
}

export interface AreaCalculationInput {
  /** Direct net area input in m² (if not providing detailed floor/wall dimensions) */
  netArea?: number;
  /** Detailed floor dimensions in metres */
  floors?: FloorDimensionInput[];
  /** Detailed wall dimensions in metres */
  walls?: WallDimensionInput[];
  /** Laying pattern to determine wastage percentage */
  pattern?: LayingPattern;
  /** Custom wastage percentage override (e.g. 10 for 10%) */
  customWastagePercent?: number;
}

export interface AreaCalculationResult {
  netAreaM2: number;
  wastagePercent: number;
  wastageAreaM2: number;
  grossAreaM2: number;
  breakdown: {
    floorsAreaM2: number;
    wallsAreaM2: number;
    deductionsAreaM2: number;
  };
}

export interface TileDimensions {
  /** Tile length in millimetres (e.g., 600) */
  lengthMm: number;
  /** Tile width in millimetres (e.g., 300) */
  widthMm: number;
  /** Tile thickness in millimetres (default: 10mm) */
  thicknessMm?: number;
}

export interface TilePackagingInput {
  /** Square metres per box provided by supplier (e.g. 1.44 m²) */
  m2PerBox?: number;
  /** Number of tile pieces per box (if m² per box is not known) */
  piecesPerBox?: number;
}

export interface TileCountResult {
  singleTileAreaM2: number;
  netPiecesRequired: number;
  grossPiecesRequired: number;
  m2PerBox: number;
  piecesPerBox: number;
  boxesRequired: number;
  totalAreaSuppliedM2: number;
  surplusAreaM2: number;
  surplusPieces: number;
}

export interface AdhesiveCalculationInput {
  grossAreaM2: number;
  trowelNotch?: TrowelNotchSize;
  /** Custom coverage rate in m² per 20kg bag */
  customCoverageM2PerBag?: number;
  /** Bag weight in kg (default: 20kg standard trade bag) */
  bagWeightKg?: number;
}

export interface AdhesiveCalculationResult {
  bagsRequired: number;
  totalKg: number;
  bagWeightKg: number;
  coveragePerBagM2: number;
  trowelNotch: TrowelNotchSize | 'custom';
  estimatedKgPerM2: number;
}

export interface GroutCalculationInput {
  /** Total area to be grouted in m² (typically gross area) */
  areaM2: number;
  /** Tile length in mm */
  lengthMm: number;
  /** Tile width in mm */
  widthMm: number;
  /** Tile thickness in mm (default: 10mm) */
  thicknessMm?: number;
  /** Grout joint width in mm (default: 2mm) */
  jointWidthMm?: number;
  /** Grout density in kg/dm³ (default: 1.6 for cementitious, 1.55 for epoxy) */
  density?: number;
  /** Wastage factor multiplier (default: 1.15 for 15% trade waste) */
  wasteFactor?: number;
  /** Grout formulation type */
  groutType?: GroutType;
}

export interface GroutBagRecommendation {
  bagSizeKg: number;
  bagsCount: number;
}

export interface GroutCalculationResult {
  totalKg: number;
  theoreticalKg: number;
  wastePercent: number;
  jointWidthMm: number;
  thicknessMm: number;
  density: number;
  recommendedBags: GroutBagRecommendation[];
}

export interface WaterproofingCalculationInput {
  /** Waterproofing area in m² (shower walls up to 1.8-2.0m, bathroom floor + 150mm upturns) */
  areaM2: number;
  /** Internal corners/perimeter linear metres requiring bond breaker bandage tape */
  internalPerimeterLinearM?: number;
  /** Primer coverage in m²/L (default: ~7 m²/L) */
  primerCoverageM2PerLitre?: number;
  /** Membrane consumption in L/m² for 2 coats (default: ~1.5 L/m²) */
  membraneLitresPerM2?: number;
}

export interface WaterproofingCalculationResult {
  areaM2: number;
  primerLitres: number;
  primer4LDrums: number;
  primer15LDrums: number;
  membraneLitres: number;
  membrane15LDrums: number;
  numberOfCoats: number;
  bondBreakerLinearMetres: number;
  bondBreaker50mRolls: number;
}

export interface SiliconeCalculationInput {
  /** Linear metres of internal wall corners, floor junctions, and vanity/fixture perimeters */
  linearMetres: number;
  /** Linear metres per 300ml cartridge (default: 3.0m) */
  coverageMPerTube?: number;
}

export interface SiliconeCalculationResult {
  linearMetres: number;
  tubesRequired: number;
  coveragePerTubeM: number;
  tubeVolumeMl: number;
}

export interface LevellingClipsCalculationInput {
  grossAreaM2: number;
  lengthMm: number;
  widthMm: number;
  /** Spacing between clips in mm (default: 250mm) */
  spacingMm?: number;
}

export interface LevellingClipsCalculationResult {
  clipsPerM2: number;
  totalClipsRequired: number;
  recommendedClipPacks: {
    packSize: number;
    packsCount: number;
  };
  reusableWedgesRequired: number;
  recommendedWedgePacks: {
    packSize: number;
    packsCount: number;
  };
}

export interface BillOfMaterialsItem {
  category: 'tiles' | 'adhesive' | 'grout' | 'waterproofing' | 'silicone' | 'levelling';
  item: string;
  quantity: number;
  unit: string;
  description: string;
}

/** Master input interface for calculating an entire tiling project */
export interface TileCalculationInput {
  /** Area configuration */
  area: AreaCalculationInput;
  /** Tile dimensions */
  tile: TileDimensions;
  /** Tile packaging specs (optional) */
  packaging?: TilePackagingInput;
  /** Adhesive configuration */
  adhesive?: {
    trowelNotch?: TrowelNotchSize;
    customCoverageM2PerBag?: number;
    bagWeightKg?: number;
  };
  /** Grout configuration */
  grout?: {
    jointWidthMm?: number;
    thicknessMm?: number;
    groutType?: GroutType;
    density?: number;
    wasteFactor?: number;
  };
  /** Wet area waterproofing configuration (optional) */
  waterproofing?: {
    enabled?: boolean;
    waterproofingAreaM2?: number;
    internalPerimeterLinearM?: number;
  };
  /** Perimeter silicone configuration (optional) */
  silicone?: {
    internalPerimeterLinearM?: number;
    coverageMPerTube?: number;
  };
  /** Levelling clips configuration (optional) */
  levelling?: {
    enabled?: boolean;
    spacingMm?: number;
  };
}

export interface TileCalculationResult {
  area: AreaCalculationResult;
  tiles: TileCountResult;
  adhesive: AdhesiveCalculationResult;
  grout: GroutCalculationResult;
  waterproofing: WaterproofingCalculationResult | null;
  silicone: SiliconeCalculationResult | null;
  levelling: LevellingClipsCalculationResult | null;
  billOfMaterials: BillOfMaterialsItem[];
}

// ==========================================
// 3. HELPER & CALCULATION FUNCTIONS
// ==========================================

/**
 * 1. Area & Wastage Calculation
 * Computes net floor/wall areas, deducts cutouts (doors/windows), and applies trade pattern wastage.
 */
export function calculateArea(input: AreaCalculationInput): AreaCalculationResult {
  let floorsAreaM2 = 0;
  let wallsAreaM2 = 0;
  let deductionsAreaM2 = 0;

  if (input.floors && input.floors.length > 0) {
    for (const floor of input.floors) {
      const grossFloor = Math.max(0, floor.length) * Math.max(0, floor.width);
      floorsAreaM2 += grossFloor;

      if (floor.deductions) {
        for (const deduction of floor.deductions) {
          const dArea = Math.max(0, deduction.width) * Math.max(0, deduction.height);
          deductionsAreaM2 += dArea;
        }
      }
    }
  }

  if (input.walls && input.walls.length > 0) {
    for (const wall of input.walls) {
      const grossWall = Math.max(0, wall.width) * Math.max(0, wall.height);
      wallsAreaM2 += grossWall;

      if (wall.deductions) {
        for (const deduction of wall.deductions) {
          const dArea = Math.max(0, deduction.width) * Math.max(0, deduction.height);
          deductionsAreaM2 += dArea;
        }
      }
    }
  }

  let netAreaM2 = 0;
  if (floorsAreaM2 > 0 || wallsAreaM2 > 0) {
    netAreaM2 = Math.max(0, floorsAreaM2 + wallsAreaM2 - deductionsAreaM2);
  } else if (input.netArea !== undefined) {
    netAreaM2 = Math.max(0, input.netArea);
  }

  const pattern = input.pattern || 'standard';
  const wastagePercent =
    input.customWastagePercent !== undefined && input.customWastagePercent >= 0
      ? input.customWastagePercent
      : AU_TRADE_DEFAULTS.WASTAGE_PERCENTAGES[pattern] ?? AU_TRADE_DEFAULTS.WASTAGE_PERCENTAGES.standard;

  const wastageMultiplier = 1 + wastagePercent / 100;
  const grossAreaM2 = Number((netAreaM2 * wastageMultiplier).toFixed(2));
  const wastageAreaM2 = Number((grossAreaM2 - netAreaM2).toFixed(2));

  return {
    netAreaM2: Number(netAreaM2.toFixed(2)),
    wastagePercent,
    wastageAreaM2,
    grossAreaM2,
    breakdown: {
      floorsAreaM2: Number(floorsAreaM2.toFixed(2)),
      wallsAreaM2: Number(wallsAreaM2.toFixed(2)),
      deductionsAreaM2: Number(deductionsAreaM2.toFixed(2)),
    },
  };
}

/**
 * 2. Tile Piece Count and Box Calculator
 * Given tile dimensions (mm) and area, calculates exact tile pieces, boxes required, and surplus.
 */
export function calculateTileAndBoxCount(
  grossAreaM2: number,
  netAreaM2: number,
  tile: TileDimensions,
  packaging?: TilePackagingInput
): TileCountResult {
  const lengthM = tile.lengthMm / 1000;
  const widthM = tile.widthMm / 1000;
  const singleTileAreaM2 = Number((lengthM * widthM).toFixed(6));

  if (singleTileAreaM2 <= 0) {
    throw new Error('Tile dimensions must be greater than 0 mm.');
  }

  const netPiecesRequired = Math.ceil(netAreaM2 / singleTileAreaM2);
  const grossPiecesRequired = Math.ceil(grossAreaM2 / singleTileAreaM2);

  let piecesPerBox = packaging?.piecesPerBox;
  let m2PerBox = packaging?.m2PerBox;

  if (m2PerBox && m2PerBox > 0 && (!piecesPerBox || piecesPerBox <= 0)) {
    piecesPerBox = Math.max(1, Math.round(m2PerBox / singleTileAreaM2));
  } else if (piecesPerBox && piecesPerBox > 0 && (!m2PerBox || m2PerBox <= 0)) {
    m2PerBox = Number((piecesPerBox * singleTileAreaM2).toFixed(3));
  } else if (!m2PerBox && !piecesPerBox) {
    // Standard estimate: ~1.44m² per box or closest integer piece set
    const estimatedPieces = Math.max(1, Math.round(1.44 / singleTileAreaM2));
    piecesPerBox = estimatedPieces;
    m2PerBox = Number((estimatedPieces * singleTileAreaM2).toFixed(3));
  }

  const resolvedM2PerBox = m2PerBox && m2PerBox > 0 ? m2PerBox : singleTileAreaM2;
  const resolvedPiecesPerBox = piecesPerBox && piecesPerBox > 0 ? piecesPerBox : 1;

  // Box calculation: based on gross area rounded up to the nearest whole box
  const boxesRequired = Math.ceil(grossAreaM2 / resolvedM2PerBox);
  const totalAreaSuppliedM2 = Number((boxesRequired * resolvedM2PerBox).toFixed(2));
  const surplusAreaM2 = Number(Math.max(0, totalAreaSuppliedM2 - netAreaM2).toFixed(2));
  const surplusPieces = Math.max(0, boxesRequired * resolvedPiecesPerBox - netPiecesRequired);

  return {
    singleTileAreaM2,
    netPiecesRequired,
    grossPiecesRequired,
    m2PerBox: resolvedM2PerBox,
    piecesPerBox: resolvedPiecesPerBox,
    boxesRequired,
    totalAreaSuppliedM2,
    surplusAreaM2,
    surplusPieces,
  };
}

/**
 * 3. Adhesive (Glue) Requirement Calculator
 * Calculates 20kg standard trade bags required based on notch size and substrate/tile demands.
 */
export function calculateAdhesive(input: AdhesiveCalculationInput): AdhesiveCalculationResult {
  const bagWeightKg = input.bagWeightKg || AU_TRADE_DEFAULTS.PACKAGING.adhesiveBagKg;
  let coveragePerBagM2: number;
  let trowelNotch: TrowelNotchSize | 'custom';

  if (input.customCoverageM2PerBag && input.customCoverageM2PerBag > 0) {
    coveragePerBagM2 = input.customCoverageM2PerBag;
    trowelNotch = 'custom';
  } else {
    trowelNotch = input.trowelNotch || '10mm';
    coveragePerBagM2 = AU_TRADE_DEFAULTS.ADHESIVE_COVERAGE[trowelNotch]?.m2PerBag ?? 4.5;
  }

  const bagsRequired = Math.ceil(input.grossAreaM2 / coveragePerBagM2);
  const totalKg = bagsRequired * bagWeightKg;
  const estimatedKgPerM2 = Number((bagWeightKg / coveragePerBagM2).toFixed(2));

  return {
    bagsRequired,
    totalKg,
    bagWeightKg,
    coveragePerBagM2,
    trowelNotch,
    estimatedKgPerM2,
  };
}

/**
 * 4. Grout Requirement Calculator
 * Industry trade formula:
 * Grout (kg) = ((Length + Width) / (Length * Width)) * Thickness * Joint Width * Density * Area * Waste Factor
 * All tile dimensions in mm, Area in m², Density in kg/dm³ (1.6 for cementitious, 1.55 for epoxy).
 */
export function calculateGrout(input: GroutCalculationInput): GroutCalculationResult {
  const lengthMm = input.lengthMm;
  const widthMm = input.widthMm;
  const thicknessMm = input.thicknessMm || AU_TRADE_DEFAULTS.GROUT.defaultThicknessMm;
  const jointWidthMm = input.jointWidthMm || AU_TRADE_DEFAULTS.GROUT.defaultJointWidthMm;

  let density = input.density;
  if (!density) {
    density = input.groutType === 'epoxy'
      ? AU_TRADE_DEFAULTS.GROUT.epoxyDensity
      : AU_TRADE_DEFAULTS.GROUT.cementitiousDensity;
  }

  const wasteFactor = input.wasteFactor || AU_TRADE_DEFAULTS.GROUT.wasteFactor; // Default 1.15 (+15%)

  if (lengthMm <= 0 || widthMm <= 0) {
    throw new Error('Tile length and width must be greater than 0 mm.');
  }

  // Formula derivation:
  // Volume per m² = ((L + W) / (L * W)) * J * T * 10^-3 m³
  // Mass per m² = Volume * (Density * 1000 kg/m³) = ((L + W) / (L * W)) * J * T * Density kg/m²
  const jointFactor = (lengthMm + widthMm) / (lengthMm * widthMm);
  const theoreticalKgPerM2 = jointFactor * thicknessMm * jointWidthMm * density;
  const theoreticalKg = theoreticalKgPerM2 * input.areaM2;
  const totalKg = Number((theoreticalKg * wasteFactor).toFixed(2));

  // Determine optimal bag breakdown (e.g. 2kg, 5kg, 20kg bags)
  const recommendedBags: GroutBagRecommendation[] = [];
  let remainingKg = totalKg;

  if (remainingKg >= 15) {
    const bags20 = Math.floor(remainingKg / 20);
    if (bags20 > 0) {
      recommendedBags.push({ bagSizeKg: 20, bagsCount: bags20 });
      remainingKg -= bags20 * 20;
    }
  }

  if (remainingKg > 0) {
    const bags5 = Math.ceil(remainingKg / 5);
    // If small amount, check if 2kg bags are more appropriate for small jobs
    if (remainingKg <= 2) {
      recommendedBags.push({ bagSizeKg: 2, bagsCount: 1 });
    } else if (remainingKg <= 4) {
      recommendedBags.push({ bagSizeKg: 2, bagsCount: 2 });
    } else {
      recommendedBags.push({ bagSizeKg: 5, bagsCount: bags5 });
    }
  }

  const wastePercent = Number(((wasteFactor - 1) * 100).toFixed(0));

  return {
    totalKg,
    theoreticalKg: Number(theoreticalKg.toFixed(2)),
    wastePercent,
    jointWidthMm,
    thicknessMm,
    density,
    recommendedBags,
  };
}

/**
 * 5. Wet Area Waterproofing Calculator (AS 3740 Standards)
 * Calculates primer, Class III waterproofing membrane (2 coats), and bond breaker bandage.
 */
export function calculateWaterproofing(input: WaterproofingCalculationInput): WaterproofingCalculationResult {
  const areaM2 = Math.max(0, input.areaM2);
  const primerCoverage = input.primerCoverageM2PerLitre || AU_TRADE_DEFAULTS.WATERPROOFING.primerCoverageM2PerLitre;
  const membraneRate = input.membraneLitresPerM2 || AU_TRADE_DEFAULTS.WATERPROOFING.membraneLitresPerM2TwoCoats;

  const primerLitres = Number((areaM2 / primerCoverage).toFixed(2));
  const primer4LDrums = Math.ceil(primerLitres / 4);
  const primer15LDrums = Math.ceil(primerLitres / 15);

  const membraneLitres = Number((areaM2 * membraneRate).toFixed(2));
  const membrane15LDrums = Math.ceil(membraneLitres / 15);

  const internalPerimeterLinearM = input.internalPerimeterLinearM || 0;
  const bondBreaker50mRolls = Math.ceil(internalPerimeterLinearM / AU_TRADE_DEFAULTS.WATERPROOFING.bondBreakerRollLengthM);

  return {
    areaM2,
    primerLitres,
    primer4LDrums,
    primer15LDrums,
    membraneLitres,
    membrane15LDrums,
    numberOfCoats: 2,
    bondBreakerLinearMetres: internalPerimeterLinearM,
    bondBreaker50mRolls: Math.max(internalPerimeterLinearM > 0 ? 1 : 0, bondBreaker50mRolls),
  };
}

/**
 * 6. Perimeter Silicone Calculator
 * Calculates standard 300ml silicone tubes for internal corners, movement joints & sanitary perimeters.
 */
export function calculateSilicone(input: SiliconeCalculationInput): SiliconeCalculationResult {
  const linearMetres = Math.max(0, input.linearMetres);
  const coveragePerTubeM = input.coverageMPerTube || AU_TRADE_DEFAULTS.SILICONE.linearMetresPer300mlTube;
  const tubesRequired = Math.ceil(linearMetres / coveragePerTubeM);

  return {
    linearMetres,
    tubesRequired,
    coveragePerTubeM,
    tubeVolumeMl: AU_TRADE_DEFAULTS.SILICONE.tubeVolumeMl,
  };
}

/**
 * 7. Levelling Clips & Reusable Wedges Calculator
 * Calculates lippage control clips based on tile size and spacing standards.
 */
export function calculateLevellingSystem(input: LevellingClipsCalculationInput): LevellingClipsCalculationResult {
  const { grossAreaM2, lengthMm, widthMm } = input;
  const spacingMm = input.spacingMm || AU_TRADE_DEFAULTS.LEVELLING_SYSTEM.clipSpacingMm;

  if (lengthMm <= 0 || widthMm <= 0) {
    throw new Error('Tile dimensions must be greater than 0 mm.');
  }

  // Clips per tile edge:
  // Along length: spaced every ~250mm
  const clipsAlongLength = Math.max(1, Math.round(lengthMm / spacingMm));
  const clipsAlongWidth = Math.max(1, Math.round(widthMm / spacingMm));

  // In an installed grid, each edge is shared between 2 tiles.
  // Number of clips per tile = (clipsAlongLength + clipsAlongWidth)
  const singleTileAreaM2 = (lengthMm / 1000) * (widthMm / 1000);
  const tilesPerM2 = 1 / singleTileAreaM2;
  const clipsPerTile = clipsAlongLength + clipsAlongWidth;
  const clipsPerM2 = Number(Math.min(60, Math.max(10, Math.round(tilesPerM2 * clipsPerTile))).toFixed(1));

  const totalClipsRequired = Math.ceil(clipsPerM2 * grossAreaM2);

  // Determine standard clip bag packaging (e.g. 250, 500, 1000 packs)
  let clipPackSize = 500;
  if (totalClipsRequired <= 250) clipPackSize = 250;
  else if (totalClipsRequired <= 500) clipPackSize = 500;
  else clipPackSize = 1000;

  const clipPacksCount = Math.ceil(totalClipsRequired / clipPackSize);

  // Wedges are reusable! For single-day jobs, ~20-30m² active laying requires wedges
  const activeLayingArea = Math.min(grossAreaM2, 25);
  const reusableWedgesRequired = Math.max(100, Math.ceil(activeLayingArea * clipsPerM2));

  let wedgePackSize = 250;
  if (reusableWedgesRequired <= 100) wedgePackSize = 100;
  else if (reusableWedgesRequired <= 250) wedgePackSize = 250;
  else wedgePackSize = 500;

  const wedgePacksCount = Math.ceil(reusableWedgesRequired / wedgePackSize);

  return {
    clipsPerM2,
    totalClipsRequired,
    recommendedClipPacks: {
      packSize: clipPackSize,
      packsCount: clipPacksCount,
    },
    reusableWedgesRequired,
    recommendedWedgePacks: {
      packSize: wedgePackSize,
      packsCount: wedgePacksCount,
    },
  };
}

// ==========================================
// 4. MASTER CALCULATION ENGINE
// ==========================================

/**
 * Master calculation function: 'calculateTileProject'
 * Orchestrates complete project calculations and produces a structured bill of materials.
 */
export function calculateTileProject(input: TileCalculationInput): TileCalculationResult {
  // 1. Calculate Area & Wastage
  const areaResult = calculateArea(input.area);

  // 2. Calculate Tile Count & Box Packaging
  const tileResult = calculateTileAndBoxCount(
    areaResult.grossAreaM2,
    areaResult.netAreaM2,
    input.tile,
    input.packaging
  );

  // 3. Calculate Adhesive
  const adhesiveResult = calculateAdhesive({
    grossAreaM2: areaResult.grossAreaM2,
    trowelNotch: input.adhesive?.trowelNotch,
    customCoverageM2PerBag: input.adhesive?.customCoverageM2PerBag,
    bagWeightKg: input.adhesive?.bagWeightKg,
  });

  // 4. Calculate Grout
  const groutResult = calculateGrout({
    areaM2: areaResult.grossAreaM2,
    lengthMm: input.tile.lengthMm,
    widthMm: input.tile.widthMm,
    thicknessMm: input.grout?.thicknessMm || input.tile.thicknessMm,
    jointWidthMm: input.grout?.jointWidthMm,
    groutType: input.grout?.groutType,
    density: input.grout?.density,
    wasteFactor: input.grout?.wasteFactor,
  });

  // 5. Calculate Waterproofing (if enabled or area provided)
  let waterproofingResult: WaterproofingCalculationResult | null = null;
  const isWpEnabled = input.waterproofing?.enabled || (input.waterproofing?.waterproofingAreaM2 ?? 0) > 0;
  if (isWpEnabled) {
    const wpArea = input.waterproofing?.waterproofingAreaM2 ?? areaResult.netAreaM2;
    waterproofingResult = calculateWaterproofing({
      areaM2: wpArea,
      internalPerimeterLinearM: input.waterproofing?.internalPerimeterLinearM,
    });
  }

  // 6. Calculate Silicone (if perimeter specified)
  let siliconeResult: SiliconeCalculationResult | null = null;
  if (input.silicone?.internalPerimeterLinearM && input.silicone.internalPerimeterLinearM > 0) {
    siliconeResult = calculateSilicone({
      linearMetres: input.silicone.internalPerimeterLinearM,
      coverageMPerTube: input.silicone.coverageMPerTube,
    });
  }

  // 7. Calculate Levelling System (default true for tiles >= 300mm unless disabled)
  let levellingResult: LevellingClipsCalculationResult | null = null;
  const isLargeFormat = input.tile.lengthMm >= 300 || input.tile.widthMm >= 300;
  const isLevellingEnabled = input.levelling?.enabled ?? isLargeFormat;
  if (isLevellingEnabled) {
    levellingResult = calculateLevellingSystem({
      grossAreaM2: areaResult.grossAreaM2,
      lengthMm: input.tile.lengthMm,
      widthMm: input.tile.widthMm,
      spacingMm: input.levelling?.spacingMm,
    });
  }

  // 8. Build Comprehensive Bill of Materials (BOM)
  const billOfMaterials: BillOfMaterialsItem[] = [
    {
      category: 'tiles',
      item: `${input.tile.lengthMm}x${input.tile.widthMm}mm Tiles`,
      quantity: tileResult.boxesRequired,
      unit: 'boxes',
      description: `${tileResult.boxesRequired} boxes (${tileResult.totalAreaSuppliedM2} m², ${tileResult.boxesRequired * tileResult.piecesPerBox} pcs total incl. ${areaResult.wastagePercent}% waste)`,
    },
    {
      category: 'adhesive',
      item: 'Tile Adhesive (20kg Bag)',
      quantity: adhesiveResult.bagsRequired,
      unit: 'bags',
      description: `${adhesiveResult.bagsRequired} x 20kg bags (${adhesiveResult.trowelNotch} trowel notch @ ${adhesiveResult.coveragePerBagM2} m²/bag)`,
    },
    {
      category: 'grout',
      item: `Grout (${groutResult.jointWidthMm}mm joint)`,
      quantity: groutResult.totalKg,
      unit: 'kg',
      description: `${groutResult.totalKg} kg total (${groutResult.recommendedBags.map((b) => `${b.bagsCount}x${b.bagSizeKg}kg`).join(' + ')} bags)`,
    },
  ];

  if (waterproofingResult && waterproofingResult.areaM2 > 0) {
    billOfMaterials.push(
      {
        category: 'waterproofing',
        item: 'Waterproof Membrane (15L Pail)',
        quantity: waterproofingResult.membrane15LDrums,
        unit: 'pails',
        description: `${waterproofingResult.membrane15LDrums} x 15L pails (${waterproofingResult.membraneLitres}L total for 2 coats across ${waterproofingResult.areaM2} m²)`,
      },
      {
        category: 'waterproofing',
        item: 'Substrate Primer (4L / 15L)',
        quantity: waterproofingResult.primer4LDrums <= 3 ? waterproofingResult.primer4LDrums : waterproofingResult.primer15LDrums,
        unit: waterproofingResult.primer4LDrums <= 3 ? '4L tins' : '15L drums',
        description: `${waterproofingResult.primerLitres}L primer required for ${waterproofingResult.areaM2} m² substrate`,
      }
    );

    if (waterproofingResult.bondBreakerLinearMetres > 0) {
      billOfMaterials.push({
        category: 'waterproofing',
        item: 'Bond Breaker Bandage Tape (50m Roll)',
        quantity: waterproofingResult.bondBreaker50mRolls,
        unit: 'rolls',
        description: `${waterproofingResult.bondBreakerLinearMetres}m internal corner reinforcing bandage`,
      });
    }
  }

  if (siliconeResult && siliconeResult.tubesRequired > 0) {
    billOfMaterials.push({
      category: 'silicone',
      item: 'Sanitary Perimeter Silicone (300ml)',
      quantity: siliconeResult.tubesRequired,
      unit: 'cartridges',
      description: `${siliconeResult.tubesRequired} x 300ml cartridges for ${siliconeResult.linearMetres}m perimeter/expansion joints`,
    });
  }

  if (levellingResult && levellingResult.totalClipsRequired > 0) {
    billOfMaterials.push(
      {
        category: 'levelling',
        item: 'Lippage Levelling Clips',
        quantity: levellingResult.recommendedClipPacks.packsCount,
        unit: `packs of ${levellingResult.recommendedClipPacks.packSize}`,
        description: `${levellingResult.totalClipsRequired} disposable clips required (${levellingResult.clipsPerM2} clips/m²)`,
      },
      {
        category: 'levelling',
        item: 'Reusable Levelling Wedges',
        quantity: levellingResult.recommendedWedgePacks.packsCount,
        unit: `packs of ${levellingResult.recommendedWedgePacks.packSize}`,
        description: `${levellingResult.reusableWedgesRequired} reusable wedges for active laying area`,
      }
    );
  }

  return {
    area: areaResult,
    tiles: tileResult,
    adhesive: adhesiveResult,
    grout: groutResult,
    waterproofing: waterproofingResult,
    silicone: siliconeResult,
    levelling: levellingResult,
    billOfMaterials,
  };
}
