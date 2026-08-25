import { GoogleGenAI } from '@google/genai';

export interface AiTriageResult {
  summary: string;
  scopeAssessment: 'Small' | 'Medium' | 'Large' | 'Extensive';
  estimateLow: number;
  estimateHigh: number;
  draftProposal: string;
}

export interface QuoteTriageInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
}

const SYSTEM_INSTRUCTION = `You are a master tiling industry expert and estimator assistant for "Pro Square Tiling", a high-end residential and commercial tiling contractor in Australia.

When provided with a customer's quote request, evaluate the job and return ONLY a valid JSON object matching this schema:
{
  "summary": "Concise 1-2 sentence executive summary of what the customer is asking for",
  "scopeAssessment": "Small" | "Medium" | "Large" | "Extensive",
  "estimateLow": number (AUD ballpark minimum cost, based on $50-$120/m² labour + prep + waterproofing if applicable),
  "estimateHigh": number (AUD ballpark maximum cost),
  "draftProposal": "A polite, professional draft email reply from Pro Square Tiling acknowledging their specific details, offering a preliminary estimate range, and proposing an on-site measure date."
}

Important guidelines:
- If dimensions are unspecified, assume realistic standard room sizes (e.g. standard bathroom ~20-30m² wall+floor, kitchen backsplash ~4-8m², general floor ~40-80m²).
- Do not include markdown codeblocks or extra text outside the JSON object.`;

export async function runAiTriage(quote: QuoteTriageInput): Promise<AiTriageResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[AI Triage] GEMINI_API_KEY is not set. Skipping AI triage.');
    return null;
  }

  const prompt = `Customer Details:
Name: ${quote.firstName} ${quote.lastName}
Email: ${quote.email}
Phone: ${quote.phone}
Project Type: ${quote.projectType}
Project Details:
${quote.message}`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // 15-second timeout wrapper
    const triagePromise = async (): Promise<AiTriageResult | null> => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text?.trim();
      if (!text) {
        throw new Error('Empty response received from Gemini model');
      }

      // Clean potential JSON markdown fence if returned
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        summary: String(parsed.summary || `Request for ${quote.projectType} tiling`),
        scopeAssessment: ['Small', 'Medium', 'Large', 'Extensive'].includes(parsed.scopeAssessment)
          ? parsed.scopeAssessment
          : 'Medium',
        estimateLow: typeof parsed.estimateLow === 'number' ? parsed.estimateLow : 850,
        estimateHigh: typeof parsed.estimateHigh === 'number' ? parsed.estimateHigh : 2200,
        draftProposal: String(parsed.draftProposal || ''),
      };
    };

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('AI Triage timed out after 15 seconds')), 15000)
    );

    return await Promise.race([triagePromise(), timeoutPromise]);
  } catch (error) {
    console.error('[AI Triage Error]', error);
    return null;
  }
}
