import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

const AEGIS_SYSTEM_INSTRUCTION = `Role: You are the core intelligence synthesis engine for AEGIS-1945, a geopolitical and strategic conflict observatory.

Strict Verification Mandate: You must ONLY cite official, verified national governmental statements (Heads of State, Ministries of Foreign Affairs, Ministries of Defense, or official UN Security Council records). Reject tabloid speculation, anonymous leaks, and unverified social media claims. Always attach the primary official domain or transcript reference (.gov, .mil, .europa.eu, un.org, mofa.go.jp, fmprc.gov.cn, mid.ru, gov.uk, etc.).

Classification Rules: Categorize every statement strictly into: ESCALATION_WARNING, MILITARY_STRIKE, STRATEGIC_DEAL_ECONOMIC, or PEACE_OVERTURE.

Scenario Modeling Rules: When generating entries for the Projected Possible Events module, explicitly weigh: (1) historical regime behavior since 1945, (2) the current government's left- or right-wing ideological posture and internal domestic opposition, and (3) macroeconomic/wealth stress factors (sovereign debt, corporate lobbying, sanctions, and trade chokepoints). Maintain a neutral, analytical, intelligence-briefing tone. Keep verbatim quotes concise and faithful to official public statements.`;

const AEGIS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    leadership_statements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          timestamp_utc: { type: Type.STRING },
          country_iso3: { type: Type.STRING },
          leader_name: { type: Type.STRING },
          official_title: { type: Type.STRING },
          regime_alignment: {
            type: Type.STRING,
            enum: [
              'LEFT_WING',
              'CENTER_LEFT',
              'CENTER_RIGHT',
              'RIGHT_WING',
              'AUTHORITARIAN_STATE',
              'THEOCRATIC',
            ],
          },
          category: {
            type: Type.STRING,
            enum: [
              'ESCALATION_WARNING',
              'MILITARY_STRIKE',
              'STRATEGIC_DEAL_ECONOMIC',
              'PEACE_OVERTURE',
            ],
          },
          verbatim_quote: { type: Type.STRING },
          official_source_url: { type: Type.STRING },
          verification_status: {
            type: Type.STRING,
            enum: ['CONFIRMED_GOV_RELEASE', 'UN_TRANSCRIPT'],
          },
          coordinates: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: '[longitude, latitude]',
          },
        },
        required: [
          'id',
          'country_iso3',
          'leader_name',
          'category',
          'verbatim_quote',
          'official_source_url',
        ],
      },
    },
    projected_scenarios: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scenario_title: { type: Type.STRING },
          probability_index: { type: Type.NUMBER },
          time_horizon: { type: Type.STRING },
          primary_actors: { type: Type.ARRAY, items: { type: Type.STRING } },
          historical_precedent_ref: { type: Type.STRING },
          internal_domestic_friction: { type: Type.STRING },
          economic_wealth_stressors: { type: Type.STRING },
          escalation_or_deescalation_path: { type: Type.STRING },
        },
        required: [
          'scenario_title',
          'probability_index',
          'time_horizon',
          'primary_actors',
          'historical_precedent_ref',
          'internal_domestic_friction',
          'economic_wealth_stressors',
          'escalation_or_deescalation_path',
        ],
      },
    },
  },
  required: ['leadership_statements', 'projected_scenarios'],
};

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractGroundingSources(response: unknown): Array<{ title: string; uri: string }> {
  const res = response as {
    candidates?: Array<{
      groundingMetadata?: {
        groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
      };
    }>;
  };
  const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const sources: Array<{ title: string; uri: string }> = [];

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    if (uri && !seen.has(uri)) {
      seen.add(uri);
      sources.push({
        title: chunk.web?.title || uri,
        uri,
      });
    }
  }
  return sources;
}

function mapGeminiErrorStatus(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
    return {
      status: 403,
      message:
        'Gemini API authorization failed. Please verify GEMINI_API_KEY in the Settings > Secrets panel.',
    };
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
    return {
      status: 429,
      message: 'Gemini API rate limit reached. Retry shortly or verify billing tier in Secrets.',
    };
  }
  return {
    status: 500,
    message: msg || 'Intelligence synthesis request failed.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'aegis-1945' });
  });

  app.get('/api/config', (_req, res) => {
    const mapsApiKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    res.json({
      mapsApiKey,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.post('/api/intelligence/sweep', async (req, res) => {
    try {
      const { region = 'Global', focusQuery = '' } = (req.body ?? {}) as {
        region?: string;
        focusQuery?: string;
      };

      const ai = createGeminiClient();
      const prompt = [
        `Conduct a live governmental intelligence sweep for region: "${region}".`,
        focusQuery ? `Analytical focus: "${focusQuery}".` : '',
        'Search recent official government press releases, Foreign Ministry briefings, Defense Ministry updates, and UN Security Council records.',
        'Return 3 to 5 verified leadership_statements (using exact [longitude, latitude] capital coordinates and canonical official domains like .gov, .mil, un.org, .europa.eu, gov.uk, mofa.go.jp) and 2 projected_scenarios grounded in current diplomatic and economic realities.',
        'Probability index must be an integer from 0 to 100.',
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: AEGIS_SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: AEGIS_RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as Record<string, unknown>;
      const groundingSources = extractGroundingSources(response);

      res.json({
        leadership_statements: Array.isArray(parsed.leadership_statements)
          ? parsed.leadership_statements
          : [],
        projected_scenarios: Array.isArray(parsed.projected_scenarios)
          ? parsed.projected_scenarios
          : [],
        groundingSources,
        sweptAtUtc: new Date().toISOString(),
        query: focusQuery || region,
      });
    } catch (err) {
      const mapped = mapGeminiErrorStatus(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  app.post('/api/intelligence/scenarios', async (req, res) => {
    try {
      const {
        region = 'Global',
        horizon = '90-Day',
        stressFocus = 'All Factors',
        customPrompt = '',
      } = (req.body ?? {}) as {
        region?: string;
        horizon?: string;
        stressFocus?: string;
        customPrompt?: string;
      };

      const ai = createGeminiClient();
      const prompt = [
        `Synthesize 2 to 3 multi-factor geopolitical projected_scenarios for region: "${region}" over time horizon: "${horizon}".`,
        `Primary analytical lens: "${stressFocus}".`,
        customPrompt ? `Specific briefing request: "${customPrompt}".` : '',
        'Also include 1 to 2 supporting verified leadership_statements from official government or UN records that anchor the diplomatic signals.',
        'Weigh (1) post-1945 historical regime behavior, (2) left/right-wing ideological and domestic coalition fault lines, and (3) sovereign debt, corporate lobbying, and maritime chokepoint wealth stressors.',
        'Probability index must be an integer from 0 to 100.',
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: AEGIS_SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: AEGIS_RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as Record<string, unknown>;
      const groundingSources = extractGroundingSources(response);

      res.json({
        leadership_statements: Array.isArray(parsed.leadership_statements)
          ? parsed.leadership_statements
          : [],
        projected_scenarios: Array.isArray(parsed.projected_scenarios)
          ? parsed.projected_scenarios
          : [],
        groundingSources,
        generatedAtUtc: new Date().toISOString(),
      });
    } catch (err) {
      const mapped = mapGeminiErrorStatus(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AEGIS-1945 server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AEGIS-1945 server:', err);
  process.exit(1);
});
