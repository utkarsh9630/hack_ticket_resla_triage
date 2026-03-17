import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

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

  const [systemPrompt, guidanceContext] = await Promise.all([loadPrompt(), loadGuidanceContext()]);
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
            content: systemPrompt,
          },
          {
            role: "user",
            content: buildUserPrompt(input, guidanceContext),
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

async function loadPrompt(): Promise<string> {
  try {
    const promptPath = path.join(process.cwd(), "prompts", "prompt.txt");
    return await readFile(promptPath, "utf8");
  } catch {
    return [
      "You are TicketGuard, a scam-triage supervisor for ticket resale safety.",
      "Return JSON only. Do not use markdown. Do not include commentary outside JSON.",
      "Never accuse a seller of criminal intent. Use non-accusatory language about risk indicators.",
      "Calibrate confidence between 0 and 1.",
      "Always return exactly these top-level keys:",
      "risk_level, confidence, banner, reasons, action_steps, templates, cod_log",
      "The reasons array should contain up to 3 concise, evidence-backed items.",
    ].join(" ");
  }
}

async function loadGuidanceContext(): Promise<string> {
  try {
    const guidanceDir = path.join(process.cwd(), "data", "guidance");
    const files = (await readdir(guidanceDir)).filter((file) => file.endsWith(".md")).sort();
    const contents = await Promise.all(
      files.map(async (file) => {
        const content = await readFile(path.join(guidanceDir, file), "utf8");
        return `FILE: ${file}\n${content}`;
      }),
    );

    return contents.join("\n\n---\n\n");
  } catch {
    return "";
  }
}

function buildUserPrompt(input: NormalizedTriageRequest, guidanceContext: string): string {
  return JSON.stringify(
    {
      task: "Analyze the following ticket resale interaction for scam risk and output strict JSON only.",
      input,
      guidance_context: guidanceContext,
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
