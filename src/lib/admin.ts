const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "focusontec/toolalts";

interface GitHubFile {
  sha: string;
  content: string;
}

export async function getFileFromGitHub(path: string): Promise<GitHubFile> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    sha: data.sha,
    content: Buffer.from(data.content, "base64").toString("utf-8"),
  };
}

export async function updateFileOnGitHub(
  path: string,
  content: string,
  message: string,
  sha: string
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString("base64"),
        sha,
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${error}`);
  }
}

export async function triggerWorkflow(
  workflowId: string,
  ref = "main"
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflowId}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref }),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to trigger workflow: ${res.status}`);
  }
}

export async function getWorkflowRuns(workflowId?: string): Promise<any[]> {
  const url = workflowId
    ? `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflowId}/runs?per_page=10`
    : `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=10`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch runs: ${res.status}`);
  }

  const data = await res.json();
  return data.workflow_runs || [];
}
