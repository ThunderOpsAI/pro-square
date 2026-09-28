import { GoogleGenAI } from '@google/genai';
import { ExpenseCategory } from '@/components/admin/budget/types';

export interface ScannedReceiptResult {
  merchantName: string;
  invoiceNumber: string | null;
  date: string; // YYYY-MM-DD
  totalAmount: number;
  gstAmount: number;
  category: ExpenseCategory;
  description: string;
  isTaxDeductible: boolean;
  lineItems?: Array<{ description: string; quantity?: number; amount?: number }>;
  paymentMethod?: string;
  confidenceNotes?: string;
}

const SYSTEM_INSTRUCTION = `You are an expert Australian bookkeeper and financial assistant for "Pro Square Tiling", an Australian tiling business.
Your job is to inspect an uploaded invoice, receipt, or bill (image or PDF) and extract the financial data.

The transaction is in Australian Dollars (AUD).
Australian GST is typically 10% (i.e. Total / 11 if GST is included).
Allowed categories:
- "MATERIALS": tiles, adhesives, grouts, sealants, trims, angles, silicone, waterproofing membranes, primers, screed, leveling clips, sponges.
- "TOOLS": tile cutters, grinders, diamond blades, mixing paddles, trowels, levels, safety PPE, suction cups, buckets.
- "FUEL_VEHICLE": petrol, diesel, service/repairs, van tyres, vehicle registration, road tolls (Linkt/EastLink).
- "INSURANCE": public liability, business insurance, workcover.
- "SUBCONTRACTOR": trade labor, grouters, apprentices, demolition laborers.
- "MARKETING": website, uniforms, Google/Facebook ads, signage, business cards.
- "SOFTWARE": accounting apps, CRM, phone plan.
- "GENERAL": office supplies, bank fees, misc trade expenses.

Return ONLY a valid JSON object matching this schema:
{
  "merchantName": "Name of the supplier or business (e.g. Bunnings Warehouse, Beaumont Tiles, National Tiles, Total Tools, Sydney Tools, Shell)",
  "invoiceNumber": "Invoice or tax receipt number if present, else null",
  "date": "YYYY-MM-DD format (if unclear, use today's date)",
  "totalAmount": number (the total final amount paid or payable in AUD),
  "gstAmount": number (the GST amount shown on the receipt, or totalAmount / 11 rounded to 2 decimal places if GST is included),
  "category": "MATERIALS" | "TOOLS" | "FUEL_VEHICLE" | "INSURANCE" | "SUBCONTRACTOR" | "MARKETING" | "SOFTWARE" | "GENERAL",
  "description": "Short clean summary suitable for a business ledger (e.g. Bunnings - 4x Davco SMP Evo + 20x Leveling Clips)",
  "isTaxDeductible": true,
  "paymentMethod": "EFTPOS" | "CREDIT_CARD" | "BANK_TRANSFER" | "CASH" | "DIRECT_DEBIT",
  "lineItems": [
    { "description": "Item description", "quantity": 1, "amount": 0.00 }
  ],
  "confidenceNotes": "Brief note on anything ambiguous or noteworthy"
}

Do not include markdown backticks or text outside the JSON object.`;

export async function scanReceiptWithGemini(
  base64Data: string,
  mimeType: string
): Promise<ScannedReceiptResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: 'Please scan and extract all accounting data from this Australian tax invoice / receipt for Pro Square Tiling.',
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '';
    if (!responseText) {
      throw new Error('Empty response received from AI model');
    }

    // Clean up any markdown code fencing if returned
    const cleanJson = responseText.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanJson) as ScannedReceiptResult;

    // Safety normalizations
    if (!parsed.totalAmount || isNaN(parsed.totalAmount)) {
      parsed.totalAmount = 0;
    }
    if (parsed.gstAmount === undefined || isNaN(parsed.gstAmount)) {
      parsed.gstAmount = Number((parsed.totalAmount / 11).toFixed(2));
    }

    return parsed;
  } catch (error) {
    console.error('[Receipt Scanner Error]', error);
    throw error;
  }
}
