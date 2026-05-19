/**
 * Unified LLM client supporting Ollama and DeepSeek API
 */

interface LlmResponse {
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

export async function callLlm(systemPrompt: string, userPrompt: string, options?: { jsonMode?: boolean }): Promise<LlmResponse> {
  const provider = process.env.LLM_PROVIDER || "ollama";
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || (provider === "deepseek" ? "deepseek-chat" : "gemma4:31b");

  if (provider === "deepseek") {
    if (!apiKey) throw new Error("LLM_API_KEY required for DeepSeek");
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        ...(options?.jsonMode !== false ? { response_format: { type: "json_object" } } : {}),
        temperature: 0.3,
      }),
    });
    if (!res.ok) throw new Error(`DeepSeek API error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }

  // Ollama default
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
