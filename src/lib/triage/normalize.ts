import type { NormalizedTriageRequest, TriageRequest } from "@/lib/types/triage";

export function normalizeTriageRequest(input: TriageRequest): NormalizedTriageRequest {
  return {
    text: normalizeText(input.text),
    platform: normalizeOptionalString(input.platform),
    payment_method: normalizeOptionalString(input.payment_method),
    off_platform: Boolean(input.off_platform),
    urgency: Boolean(input.urgency),
  };
}

export function hasUsableText(text: string): boolean {
  return text.trim().length >= 12;
}

function normalizeText(value: string): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value?: string): string {
  return typeof value === "string" ? value.trim() : "";
}
