'use client';

import React from 'react';
import {
  Layers,
  Box,
  Droplets,
  Wrench,
  Shield,
  Maximize2,
  Sparkles,
  Sliders,
  CheckCircle2,
  Info,
} from 'lucide-react';

export interface TileCalculatorValues {
  areaM2: number;
  tileLengthMm: number;
  tileWidthMm: number;
  tileThicknessMm: number;
  groutJointMm: number;
  trowelSizeMm: number;
  wastagePercent: number;
  isWetArea: boolean;
  pattern?: string;
  packagingPiecesPerBox?: number;
  packagingM2PerBox?: number;
}

export interface BillOfMaterialItem {
  category: 'tiles' | 'adhesive' | 'grout' | 'waterproofing' | 'silicone' | 'levelling';
  item: string;
  quantity: number;
  unit: string;
  description: string;
}

export interface TileCalculationData {
  area: {
    netAreaM2: number;
    wastagePercent: number;
    wastageAreaM2: number;
    grossAreaM2: number;
    breakdown?: {
      floorsAreaM2: number;
      wallsAreaM2: number;
      deductionsAreaM2: number;
    };
  };
  tiles: {
    singleTileAreaM2: number;
    netPiecesRequired: number;
    grossPiecesRequired: number;
    m2PerBox: number;
    piecesPerBox: number;
    boxesRequired: number;
    totalAreaSuppliedM2: number;
    surplusAreaM2: number;
    surplusPieces: number;
  };
  adhesive: {
    bagsRequired: number;
    totalKg: number;
    bagWeightKg: number;
    coveragePerBagM2: number;
    trowelNotch: string;
    estimatedKgPerM2: number;
  };
  grout: {
    totalKg: number;
    theoreticalKg: number;
    wastePercent: number;
    jointWidthMm: number;
    thicknessMm: number;
    density: number;
    recommendedBags: Array<{ bagSizeKg: number; bagsCount: number }>;
  };
  waterproofing: {
    areaM2: number;
    primerLitres: number;
    primer4LDrums: number;
    primer15LDrums: number;
    membraneLitres: number;
    membrane15LDrums: number;
    numberOfCoats: number;
    bondBreakerLinearMetres: number;
    bondBreaker50mRolls: number;
  } | null;
  silicone: {
    linearMetres: number;
    tubesRequired: number;
    coveragePerTubeM: number;
    tubeVolumeMl: number;
  } | null;
  levelling: {
    clipsPerM2: number;
    totalClipsRequired: number;
    recommendedClipPacks: { packSize: number; packsCount: number };
    reusableWedgesRequired: number;
    recommendedWedgePacks: { packSize: number; packsCount: number };
  } | null;
  billOfMaterials: BillOfMaterialItem[];
}

export interface PresetOption {
  name: string;
  length: number;
  width: number;
  thickness: number;
  joint: number;
  trowel: number;
  wastage: number;
  description: string;
}

export const TILE_PRESETS: PresetOption[] = [
  {
    name: 'Standard 600x600 Porcelain',
    length: 600,
    width: 600,
    thickness: 10,
    joint: 2,
    trowel: 10,
    wastage: 10,
    description: 'Universal main floor / bathroom standard',
  },
  {
    name: 'Large Format 1200x600',
    length: 1200,
    width: 600,
    thickness: 10,
    joint: 2,
    trowel: 12,
    wastage: 12,
    description: 'Modern luxury walls & expansive floors',
  },
  {
    name: 'Subway 300x100 Kitchen/Bath',
    length: 300,
    width: 100,
    thickness: 8,
    joint: 2,
    trowel: 8,
    wastage: 15,
    description: 'Splashbacks & feature brick-bond walls',
  },
  {
    name: 'Small Format 300x300 Floor',
    length: 300,
    width: 300,
    thickness: 9,
    joint: 3,
    trowel: 8,
    wastage: 10,
    description: 'Small laundry / balcony shower base with fall',
  },
  {
    name: 'Herringbone 300x75 Feature',
    length: 300,
    width: 75,
    thickness: 8,
    joint: 2,
    trowel: 8,
    wastage: 18,
    description: 'High-waste angled decorative layout',
  },
  {
    name: 'Outdoor Paver 600x600x20mm',
    length: 600,
    width: 600,
    thickness: 20,
    joint: 4,
    trowel: 15,
    wastage: 12,
    description: 'Heavy structural exterior porcelain pavers',
  },
];

interface TileCalculatorWidgetProps {
  values: TileCalculatorValues;
  onChange: (updated: Partial<TileCalculatorValues>) => void;
  calculatedData?: TileCalculationData | null;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function TileCalculatorWidget({
  values,
  onChange,
  calculatedData,
  isLoading = false,
  readOnly = false,
}: TileCalculatorWidgetProps) {
  const handlePresetSelect = (preset: PresetOption) => {
    onChange({
      tileLengthMm: preset.length,
      tileWidthMm: preset.width,
      tileThicknessMm: preset.thickness,
      groutJointMm: preset.joint,
      trowelSizeMm: preset.trowel,
      wastagePercent: preset.wastage,
    });
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector Bar */}
      {!readOnly && (
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary-400" />
              Tile Specification Presets
            </span>
            <span className="text-[11px] text-surface-400">Click to apply specs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {TILE_PRESETS.map((preset) => {
              const isSelected =
                values.tileLengthMm === preset.length &&
                values.tileWidthMm === preset.width &&
                values.tileThicknessMm === preset.thickness;

              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary-950/80 border-primary-600 ring-1 ring-primary-500/50 text-white'
                      : 'bg-surface-950/60 border-surface-800 hover:border-surface-700 text-surface-300 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold truncate">
                    {preset.name.split(' ')[0]} {preset.length}x{preset.width}
                  </div>
                  <div className="text-[10px] text-surface-400 truncate mt-0.5">{preset.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Inputs + BOM Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary-400" />
                Area & Material Parameters
              </h3>
              {isLoading && (
                <span className="text-xs text-primary-400 animate-pulse flex items-center gap-1 font-mono">
                  Calculating...
                </span>
              )}
            </div>

            {/* Area Slider and Direct Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="areaInput" className="text-xs font-semibold text-surface-300">
                  Total Surface Area (m²)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="areaInput"
                    type="number"
                    min="0"
                    step="0.1"
                    disabled={readOnly}
                    value={values.areaM2 || ''}
                    onChange={(e) => onChange({ areaM2: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-24 px-3 py-1 bg-surface-950 border border-surface-700 rounded-lg text-right font-mono text-sm font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-xs text-surface-400 font-medium">m²</span>
                </div>
              </div>

              {!readOnly && (
                <div className="space-y-1 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="0.5"
                    value={values.areaM2 || 0}
                    onChange={(e) => onChange({ areaM2: parseFloat(e.target.value) || 0 })}
                    className="w-full h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <div className="flex justify-between text-[10px] text-surface-400">
                    <span>0 m²</span>
                    <span>25 m²</span>
                    <span>50 m²</span>
                    <span>100 m²</span>
                    <span>150+ m²</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tile Dimensions Row */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-surface-800/80">
              <div>
                <label className="block text-[11px] font-semibold text-surface-400 mb-1">
                  Length (mm)
                </label>
                <input
                  type="number"
                  min="10"
                  max="3200"
                  disabled={readOnly}
                  value={values.tileLengthMm || ''}
                  onChange={(e) =>
                    onChange({ tileLengthMm: Math.max(1, parseFloat(e.target.value) || 600) })
                  }
                  className="w-full px-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-surface-400 mb-1">
                  Width (mm)
                </label>
                <input
                  type="number"
                  min="10"
                  max="3200"
                  disabled={readOnly}
                  value={values.tileWidthMm || ''}
                  onChange={(e) =>
                    onChange({ tileWidthMm: Math.max(1, parseFloat(e.target.value) || 600) })
                  }
                  className="w-full px-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-surface-400 mb-1">
                  Thickness (mm)
                </label>
                <input
                  type="number"
                  min="3"
                  max="50"
                  step="0.5"
                  disabled={readOnly}
                  value={values.tileThicknessMm || ''}
                  onChange={(e) =>
                    onChange({ tileThicknessMm: Math.max(1, parseFloat(e.target.value) || 10) })
                  }
                  className="w-full px-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Technical Installation Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-surface-800/80">
              <div>
                <label className="block text-[11px] font-semibold text-surface-400 mb-1">
                  Grout Joint (mm)
                </label>
                <select
                  disabled={readOnly}
                  value={values.groutJointMm || 2}
                  onChange={(e) => onChange({ groutJointMm: parseFloat(e.target.value) || 2 })}
                  className="w-full px-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value={1.5}>1.5 mm (Rectified Fine)</option>
                  <option value={2}>2.0 mm (Standard AU)</option>
                  <option value={3}>3.0 mm (Cushion edge)</option>
                  <option value={4}>4.0 mm (Outdoor/Feature)</option>
                  <option value={5}>5.0 mm (Handmade/Stone)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-surface-400 mb-1">
                  Trowel Notch Size
                </label>
                <select
                  disabled={readOnly}
                  value={values.trowelSizeMm || 10}
                  onChange={(e) => onChange({ trowelSizeMm: parseFloat(e.target.value) || 10 })}
                  className="w-full px-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value={6}>6 mm notch (Small wall)</option>
                  <option value={8}>8 mm notch (Medium tile)</option>
                  <option value={10}>10 mm notch (Standard 600)</option>
                  <option value={12}>12 mm notch (Large format)</option>
                  <option value={15}>15 mm notch (Uneven/Paver)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-surface-400 mb-1">
                  Wastage Allowance (%)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    disabled={readOnly}
                    value={values.wastagePercent}
                    onChange={(e) =>
                      onChange({ wastagePercent: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                    className="w-full px-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-xs text-surface-400 font-semibold">%</span>
                </div>
              </div>
            </div>

            {/* Wet Area & Waterproofing Checkbox Toggle */}
            <div className="pt-2 border-t border-surface-800/80 flex items-center justify-between bg-surface-950/40 p-3 rounded-xl border border-surface-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-950/70 border border-blue-800/60 rounded-lg text-blue-400">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Wet Area / Waterproofing Scope</div>
                  <div className="text-[11px] text-surface-400">
                    Includes AS 3740 dual-coat membrane, substrate primer & sanitary silicone
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={values.isWetArea}
                  onChange={(e) => onChange({ isWetArea: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Right BOM Output Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-surface-900 via-surface-900 to-surface-950 border border-surface-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Box className="h-4 w-4" />
                <h3 className="text-sm font-bold text-white">Live Bill of Materials (BOM)</h3>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                AS 3958.1 Trade Spec
              </span>
            </div>

            {/* Quick Gross Area Calculation Summary */}
            <div className="grid grid-cols-2 gap-2 bg-surface-950/60 p-3 rounded-xl border border-surface-800/80 text-xs">
              <div>
                <span className="text-[10px] text-surface-400 uppercase font-semibold">Net Surface Area</span>
                <div className="font-mono text-sm font-bold text-white mt-0.5">
                  {calculatedData?.area.netAreaM2 ?? values.areaM2} m²
                </div>
              </div>
              <div>
                <span className="text-[10px] text-surface-400 uppercase font-semibold">Gross Incl. Waste</span>
                <div className="font-mono text-sm font-bold text-primary-400 mt-0.5">
                  {calculatedData?.area.grossAreaM2 ??
                    (values.areaM2 * (1 + values.wastagePercent / 100)).toFixed(2)}{' '}
                  m²
                </div>
              </div>
            </div>

            {/* Materials Breakdown Items */}
            <div className="space-y-2.5 text-xs">
              {/* 1. Tiles & Boxes */}
              <div className="p-3 bg-surface-950/40 rounded-xl border border-surface-800/70 flex items-start gap-3">
                <div className="p-2 bg-primary-950/80 border border-primary-800/60 rounded-lg text-primary-400 shrink-0 mt-0.5">
                  <Maximize2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>Tiles Needed</span>
                    <span className="font-mono text-primary-400 font-bold">
                      {calculatedData?.tiles.boxesRequired ??
                        Math.ceil((values.areaM2 * (1 + values.wastagePercent / 100)) / 1.44)}{' '}
                      Boxes
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-400 mt-0.5">
                    {calculatedData?.tiles.totalAreaSuppliedM2 ??
                      (values.areaM2 * (1 + values.wastagePercent / 100)).toFixed(2)}{' '}
                    m² total supplied ({calculatedData?.tiles.grossPiecesRequired ?? '—'} pcs)
                  </p>
                </div>
              </div>

              {/* 2. Adhesive (Glue) */}
              <div className="p-3 bg-surface-950/40 rounded-xl border border-surface-800/70 flex items-start gap-3">
                <div className="p-2 bg-amber-950/80 border border-amber-800/60 rounded-lg text-amber-400 shrink-0 mt-0.5">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>Tile Adhesive</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {calculatedData?.adhesive.bagsRequired ?? Math.ceil(values.areaM2 / 4.5)} x 20kg
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-400 mt-0.5">
                    {calculatedData?.adhesive.totalKg ?? Math.ceil(values.areaM2 / 4.5) * 20} kg total (
                    {calculatedData?.adhesive.trowelNotch ?? '10mm'} notch coverage)
                  </p>
                </div>
              </div>

              {/* 3. Grout */}
              <div className="p-3 bg-surface-950/40 rounded-xl border border-surface-800/70 flex items-start gap-3">
                <div className="p-2 bg-purple-950/80 border border-purple-800/60 rounded-lg text-purple-400 shrink-0 mt-0.5">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>Grout Required</span>
                    <span className="font-mono text-purple-400 font-bold">
                      {calculatedData?.grout.totalKg ?? (values.areaM2 * 0.45).toFixed(1)} kg
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-400 mt-0.5">
                    {calculatedData?.grout.recommendedBags && calculatedData.grout.recommendedBags.length > 0
                      ? calculatedData.grout.recommendedBags
                          .map((b) => `${b.bagsCount}x${b.bagSizeKg}kg bag`)
                          .join(' + ')
                      : 'Standard flexible polymer grout'}
                  </p>
                </div>
              </div>

              {/* 4. Waterproofing & Silicone (If wet area) */}
              {values.isWetArea && (
                <>
                  <div className="p-3 bg-surface-950/40 rounded-xl border border-surface-800/70 flex items-start gap-3">
                    <div className="p-2 bg-blue-950/80 border border-blue-800/60 rounded-lg text-blue-400 shrink-0 mt-0.5">
                      <Droplets className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between font-semibold text-white">
                        <span>Waterproof Membrane</span>
                        <span className="font-mono text-blue-400 font-bold">
                          {calculatedData?.waterproofing?.membrane15LDrums ?? Math.ceil((values.areaM2 * 1.5) / 15)}{' '}
                          x 15L Pails
                        </span>
                      </div>
                      <p className="text-[11px] text-surface-400 mt-0.5">
                        {calculatedData?.waterproofing?.membraneLitres ?? (values.areaM2 * 1.5).toFixed(1)}L
                        membrane + {calculatedData?.waterproofing?.primerLitres ?? (values.areaM2 / 7).toFixed(1)}L
                        primer
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-950/40 rounded-xl border border-surface-800/70 flex items-start gap-3">
                    <div className="p-2 bg-cyan-950/80 border border-cyan-800/60 rounded-lg text-cyan-400 shrink-0 mt-0.5">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between font-semibold text-white">
                        <span>Sanitary Silicone</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {calculatedData?.silicone?.tubesRequired ??
                            Math.max(1, Math.ceil((Math.sqrt(values.areaM2) * 4) / 3))}{' '}
                          Tubes
                        </span>
                      </div>
                      <p className="text-[11px] text-surface-400 mt-0.5">
                        100% neutral cure anti-fungal perimeter movement joints
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* 5. Levelling Clips */}
              {(values.tileLengthMm >= 300 || values.tileWidthMm >= 300) && (
                <div className="p-3 bg-surface-950/40 rounded-xl border border-surface-800/70 flex items-start gap-3">
                  <div className="p-2 bg-emerald-950/80 border border-emerald-800/60 rounded-lg text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>Lippage Levelling Clips</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {calculatedData?.levelling?.totalClipsRequired ?? Math.ceil(values.areaM2 * 25)} Clips
                      </span>
                    </div>
                    <p className="text-[11px] text-surface-400 mt-0.5">
                      {calculatedData?.levelling?.recommendedClipPacks?.packsCount ?? 1}x pack (
                      {calculatedData?.levelling?.recommendedClipPacks?.packSize ?? 500} pcs) + reusable wedges
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-surface-800/80 flex items-center gap-2 text-[11px] text-surface-400">
              <Info className="h-3.5 w-3.5 shrink-0 text-surface-400" />
              <span>Estimates reflect standard Australian Trade Standards (AS 3958.1 & AS 3740).</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
