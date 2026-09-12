import "server-only";
import { logger } from "./logger";

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export interface TranslateNewsInput {
  titleTh: string;
  summaryTh?: string;
  contentTh: string;
}

export interface TranslateNewsOutput {
  titleEn: string;
  summaryEn: string;
  contentEn: string;
  slug: string;
}

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/**
 * ทดสอบการเชื่อมต่อ Gemini API ด้วย prompt สั้น ๆ
 */
export async function testGeminiConnection(
  config: GeminiConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = config.apiKey.trim();
    if (!key) {
      return { success: false, error: "API Key is empty" };
    }

    const model = config.model?.trim() || DEFAULT_GEMINI_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(key)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello, reply with 'OK' only to test connection.",
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10,
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = `HTTP ${response.status} ${response.statusText}`;
      try {
        const json = JSON.parse(errorBody);
        if (json.error?.message) {
          errorMsg = json.error.message;
        }
      } catch {
        // use fallback errorMsg
      }
      logger.error("Gemini connection test failed", { status: response.status, errorMsg });
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Gemini connection test exception", { error: message });
    return { success: false, error: message };
  }
}

/**
 * สั่งให้ Gemini แปลเนื้อหาข่าวสารจากภาษาไทยเป็นภาษาอังกฤษ พร้อมสร้าง URL slug
 */
export async function translateNewsWithGemini(
  config: GeminiConfig,
  input: TranslateNewsInput
): Promise<TranslateNewsOutput> {
  const key = config.apiKey.trim();
  if (!key) {
    throw new Error("gemini_api_key_missing");
  }

  const model = config.model?.trim() || DEFAULT_GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;

  const systemInstruction = `You are a professional university editor and bilingual journalist.
Translate the provided Thai university news article into formal, natural, engaging, and grammatically accurate English.
Also generate an SEO-friendly URL slug in English (lowercase, alphanumeric words separated by hyphens, strictly no Thai characters, max 60 chars).

You MUST output strictly valid JSON matching this schema:
{
  "titleEn": "string (translated headline in Title Case or sentence case)",
  "summaryEn": "string (concise summary in 1-2 sentences)",
  "contentEn": "string (full translated news content with paragraphs preserved)",
  "slug": "string (kebab-case URL slug in English)"
}`;

  const userPrompt = `Please translate this university news article into English:

[THAI TITLE]:
${input.titleTh}

[THAI SUMMARY]:
${input.summaryTh || "None provided"}

[THAI CONTENT]:
${input.contentTh}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMsg = `Gemini API error: ${response.status} ${response.statusText}`;
    try {
      const json = JSON.parse(errorBody);
      if (json.error?.message) {
        errorMsg = json.error.message;
      }
    } catch {
      // fallback
    }
    logger.error("Gemini news translation failed", { status: response.status, errorMsg });
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("No response generated from Gemini API");
  }

  try {
    const parsed = JSON.parse(rawText) as Partial<TranslateNewsOutput>;
    return {
      titleEn: (parsed.titleEn || "").trim(),
      summaryEn: (parsed.summaryEn || "").trim(),
      contentEn: (parsed.contentEn || "").trim(),
      slug: (parsed.slug || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    };
  } catch (err) {
    logger.error("Failed to parse Gemini JSON response", { rawText, err });
    throw new Error("Invalid JSON returned by Gemini API");
  }
}
