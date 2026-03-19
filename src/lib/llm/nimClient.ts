// Static imports replace runtime fs.readFile/readdir — required for Vercel serverless.
import { SYSTEM_PROMPT } from "@/lib/data/systemPrompt";
import { GUIDANCE_CONTEXT } from "@/lib/data/guidanceContext";

import type { NormalizedTriageRequest } from "@/lib/types/triage";

const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b";
const DEFAULT_TIMEOUT_MS = 20000;

export async function requestNemotronTriage(input: NormalizedTriageRequest): Promise<string> {
  const apiKey = process.env.NIM_API_KEY;

  if (!apiKey) {
    throw new Error("NIM_API_KEY is not configured");
  }

  const baseUrl = process.env.NIM_BASE_URL ?? DEFAULT_BASE_URL;
  const model = process.env.NIM_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = Number(process.env.NIM_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1400,
        stream: false,
        extra_body: {
          chat_template_kwargs: {
            enable_thinking: false,
          },
          reasoning_budget: 1024,
        },
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: buildUserPrompt(input),
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Nemotron request failed with ${response.status}: ${body}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("Nemotron response did not include message content");
    }

    return extractJson(content);
  } finally {
    clearTimeout(timeout);
  }
}

function buildUserPrompt(input: NormalizedTriageRequest): string {
  return JSON.stringify(
    {
      task: "Analyze the following ticket resale interaction for scam risk and output strict JSON only.",
      input,
      guidance_context: GUIDANCE_CONTEXT,
    },
    null,
    2,
  );
}

function extractJson(content: string): string {
  const trimmed = content.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}
