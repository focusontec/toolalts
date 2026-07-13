/**
 * Unified LLM client supporting Ollama and DeepSeek API
 * Supports text generation and vision (image understanding)
 *
 * DeepSeek calls use Node.js https directly to bypass SOCKS/HTTP proxy
 * env vars (e.g. from ShadowsocksX-NG). DeepSeek is a China-based API
 * that should be reached directly; proxy interception causes socket
 * closures on long LLM requests.
 */

import https from "https";

interface LlmResponse {
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

function httpsPost(url: string, headers: Record<string, string>, body: string, timeoutMs = 120000): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: "POST",
        headers: { ...headers, "Content-Length": Buffer.byteLength(body) },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks).toString("utf-8") });
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("DeepSeek request timed out")); });
    req.write(body);
    req.end();
  });
}

/**
 * Text-only LLM call
 */
export async function callLlm(systemPrompt: string, userPrompt: string, options?: { jsonMode?: boolean }): Promise<LlmResponse> {
  const provider = process.env.LLM_PROVIDER || "ollama";
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || (provider === "deepseek" ? "deepseek-chat" : "gemma4:31b");

  if (provider === "deepseek") {
    if (!apiKey) throw new Error("LLM_API_KEY required for DeepSeek");
    const payload = JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      ...(options?.jsonMode !== false ? { response_format: { type: "json_object" } } : {}),
      temperature: 0.3,
    });
    const res = await httpsPost("https://api.deepseek.com/chat/completions", {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }, payload);
    if (res.status !== 200) throw new Error(`DeepSeek API error: ${res.status} ${res.body}`);
    const data = JSON.parse(res.body);
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }

  // Ollama default — local, no proxy issue
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const res = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      stream: false,
      options: { temperature: 0.3 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { content: data.response };
}

/**
 * Vision (multimodal) LLM call — for image understanding
 * Uses Anthropic-compatible API (e.g. mimo-v2.5)
 */
export async function callVisionLlm(
  prompt: string,
  images: { base64: string; mimeType: string }[],
  options?: { maxTokens?: number }
): Promise<LlmResponse> {
  const apiKey = process.env.VISION_API_KEY || process.env.LLM_API_KEY;
  const baseUrl = process.env.VISION_BASE_URL || "https://token-plan-cn.xiaomimimo.com";
  const model = process.env.VISION_MODEL || "mimo-v2.5";

  if (!apiKey) throw new Error("VISION_API_KEY or LLM_API_KEY required for vision calls");

  // Anthropic-compatible message format for multimodal
  const content: any[] = [];
  for (const img of images) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mimeType,
        data: img.base64,
      },
    });
  }
  content.push({ type: "text", text: prompt });

  const res = await fetch(`${baseUrl}/anthropic/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: options?.maxTokens || 1024,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) throw new Error(`Vision API error: ${res.status} ${await res.text()}`);
  const data = await res.json() as { content: { type: string; text: string }[] };
  const textBlock = data.content.find((b) => b.type === "text");
  return { content: textBlock?.text || "" };
}

/**
 * Analyze a tool's screenshot to extract visual information
 */
export async function analyzeToolScreenshot(
  screenshotPath: string,
  toolName: string
): Promise<{ description: string; uiQuality: string; keyElements: string[] }> {
  const fs = await import("fs");
  const buf = fs.readFileSync(screenshotPath);
  const b64 = buf.toString("base64");
  const mimeType = screenshotPath.endsWith(".jpg") ? "image/jpeg" : "image/png";

  const prompt = `Analyze this screenshot of the "${toolName}" website.

Describe:
1. What the page shows (hero section, features, pricing, etc.)
2. UI/UX quality assessment (clean, cluttered, modern, dated)
3. Key visual elements (CTAs, navigation, main value proposition)

Respond in JSON:
{
  "description": "Brief description of what the page shows",
  "uiQuality": "modern/clean/dated/cluttered",
  "keyElements": ["element1", "element2", "element3"]
}`;

  const response = await callVisionLlm(prompt, [{ base64: b64, mimeType }]);
  try {
    return JSON.parse(response.content);
  } catch {
    return { description: response.content, uiQuality: "unknown", keyElements: [] };
  }
}
