import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { MaterialPresetSchema } from '@/lib/schemas';

const DEFAULT_PRESETS = [
  {
    name: 'Standard Porcelain 600x600',
    adhesiveCoveragePerBag: 4.5,
    adhesiveBagCost: 35.0,
    groutCostPerKg: 8.0,
    siliconeCostPerTube: 18.0,
    waterproofingCostPerLitre: 22.0,
    defaultDayRate: 650.0,
    defaultWastagePercent: 10.0,
  },
  {
    name: 'Large Format 1200x600',
    adhesiveCoveragePerBag: 3.5,
    adhesiveBagCost: 42.0,
    groutCostPerKg: 9.5,
    siliconeCostPerTube: 18.0,
    waterproofingCostPerLitre: 22.0,
    defaultDayRate: 750.0,
    defaultWastagePercent: 12.0,
  },
  {
    name: 'Subway 300x100',
    adhesiveCoveragePerBag: 5.0,
    adhesiveBagCost: 35.0,
    groutCostPerKg: 8.0,
    siliconeCostPerTube: 18.0,
    waterproofingCostPerLitre: 22.0,
    defaultDayRate: 700.0,
    defaultWastagePercent: 15.0,
  },
];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let presets = await prisma.materialPreset.findMany({
      orderBy: { name: 'asc' },
    });

    // Seed default presets if none exist
    if (presets.length === 0) {
      await Promise.all(
        DEFAULT_PRESETS.map((preset) =>
          prisma.materialPreset.upsert({
            where: { name: preset.name },
            create: preset,
            update: preset,
          })
        )
      );

      presets = await prisma.materialPreset.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({
      success: true,
      presets,
    });
  } catch (error) {
    console.error('[Admin Material Presets GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch material presets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const validation = MaterialPresetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues[0]?.message || 'Invalid material preset data',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const name = data.name.trim();

    const presetData = {
      name,
      adhesiveCoveragePerBag: data.adhesiveCoveragePerBag,
      adhesiveBagCost: data.adhesiveBagCost,
      groutCostPerKg: data.groutCostPerKg,
      siliconeCostPerTube: data.siliconeCostPerTube,
      waterproofingCostPerLitre: data.waterproofingCostPerLitre,
      defaultDayRate: data.defaultDayRate,
      defaultWastagePercent: data.defaultWastagePercent,
    };

    let preset;
    if (data.id) {
      preset = await prisma.materialPreset.upsert({
        where: { id: data.id },
        create: presetData,
        update: presetData,
      });
    } else {
      preset = await prisma.materialPreset.upsert({
        where: { name },
        create: presetData,
        update: presetData,
      });
    }

    return NextResponse.json(
      {
        success: true,
        preset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Admin Material Presets POST Error]', error);
    return NextResponse.json({ error: 'Failed to save material preset' }, { status: 500 });
  }
}
