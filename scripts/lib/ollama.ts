/**
 * Ollama API helpers for web search and web fetch
 * Used by enrichment and review scraping scripts
 */

interface SearchResult {
  title: string;
  url: string;
  content: string;
}

interface FetchResult {
  title: string;
  content: string;
  links: string[];
}

function getOllamaApiKeys(): string[] {
  const keys = new Set<string>();

  const add = (value: string | undefined) => {
    if (!value) return;
    for (const part of value.split(/[\n,]/)) {
      const key = part.trim();
      if (key) keys.add(key);
    }
  };

  add(process.env.OLLAMA_API_KEYS);
  add(process.env.OLLAMA_API_KEY);

  for (let i = 1; i <= 5; i++) {
    add(process.env[`OLLAMA_API_KEY_${i}`]);
  }

  return [...keys];
}

function isRetryableOllamaStatus(status: number) {
  return status === 401 || status === 403 || status === 408 || status === 429 || status >= 500;
}

async function postOllamaWithKeyFallback<T>(
  endpoint: string,
  body: Record<string, unknown>,
  timeoutMs: number,
  parseResponse: (data: unknown) => T | null,
  operationName: string
): Promise<T | null> {
  const apiKeys = getOllamaApiKeys();
  if (apiKeys.length === 0) {
    throw new Error("OLLAMA_API_KEYS or OLLAMA_API_KEY required for web search/fetch");
  }

  let lastError: unknown = null;

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok) {
        if (isRetryableOllamaStatus(res.status) && i < apiKeys.length - 1) {
          console.warn(
            `Ollama ${operationName} key ${i + 1} failed with ${res.status}; trying next key`
          );
          continue;
        }
        return null;
      }

      const data = await res.json();
      return parseResponse(data);
    } catch (err) {
      lastError = err;
      if (i < apiKeys.length - 1) {
        console.warn(
          `Ollama ${operationName} key ${i + 1} failed; trying next key`
        );
        continue;
      }
    }
  }

  if (lastError instanceof Error) {
    console.warn(`Ollama ${operationName} failed: ${lastError.message}`);
  }
  return null;
}

/**
 * Search the web using Ollama's web search API.
 */
export async function searchOllama(query: string, maxResults = 5): Promise<SearchResult[]> {
  const data = await postOllamaWithKeyFallback<{ results?: SearchResult[] }>(
    "https://ollama.com/api/web_search",
    { query, max_results: maxResults },
    15000,
    (response) => {
      if (!response || typeof response !== "object") return null;
      const results = (response as { results?: SearchResult[] }).results;
      return Array.isArray(results) ? { results } : { results: [] };
    },
    "web search"
  );

  return data?.results || [];
}

/**
 * Fetch a URL's content using Ollama's web fetch API.
 */
export async function fetchOllama(url: string): Promise<FetchResult | null> {
  return postOllamaWithKeyFallback<FetchResult>(
    "https://ollama.com/api/web_fetch",
    { url },
    20000,
    (response) => {
      if (!response || typeof response !== "object") return null;
      const data = response as FetchResult;
      return typeof data.title === "string" && typeof data.content === "string"
        ? data
        : null;
    },
    "web fetch"
  );
}

/**
 * Search and fetch: search for a query, then fetch the top result.
 * Returns combined search snippets + fetched page content.
 */
export async function searchAndFetch(query: string): Promise<string> {
  const results = await searchOllama(query, 3);
  if (results.length === 0) return "";

  const parts: string[] = [];

  // Add search snippets
  for (const r of results) {
    parts.push(`[${r.title}] ${r.url}\n${r.content}`);
  }

  // Fetch the top result for more detail
  try {
    const fetched = await fetchOllama(results[0].url);
    if (fetched && fetched.content) {
      parts.push(`\n--- Full page: ${fetched.title} ---\n${fetched.content.slice(0, 6000)}`);
    }
  } catch {
    // Fetch failed, search snippets are still useful
  }

  return parts.join("\n\n").slice(0, 12000);
}
