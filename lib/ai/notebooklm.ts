import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

// Query the GardZen NotebookLM knowledge base for gardening context.
// Returns null if NotebookLM isn't configured / authenticated.
export async function queryGardenKnowledge(question: string): Promise<string | null> {
  const notebookId = process.env.NOTEBOOKLM_NOTEBOOK_ID;
  const authJson = process.env.NOTEBOOKLM_AUTH_JSON;

  if (!notebookId) return null;

  try {
    const env = { ...process.env };
    if (authJson) env.NOTEBOOKLM_AUTH_JSON = authJson;

    const { stdout } = await exec(
      "notebooklm",
      ["ask", question, "--notebook", notebookId, "--json"],
      { env, timeout: 20_000 }
    );

    const parsed = JSON.parse(stdout) as { answer?: string };
    return parsed.answer ?? null;
  } catch {
    // NotebookLM unavailable — graceful fallback
    return null;
  }
}
