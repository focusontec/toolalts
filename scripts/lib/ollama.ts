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

/**
 * Search the web using Ollama's web search API.
 */
export async function searchOllama(query: string, maxResults = 5): Promise<SearchResult[]> {
  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) throw new Error("OLLAMA_API_KEY required for web search");

  const res = await fetch("https://ollama.com/api/web_search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, max_results: maxResults }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) return [];

  const data = await res.json() as { results?: SearchResult[] };
  return data.results || [];
}

/**
 * Fetch a URL's content using Ollama's web fetch API.
 */
export async function fetchOllama(url: string): Promise<FetchResult | null> {
  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) throw new Error("OLLAMA_API_KEY required for web fetch");

  const res = await fetch("https://ollama.com/api/web_fetch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) return null;

  const data = await res.json() as FetchResult;
  return data;
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
