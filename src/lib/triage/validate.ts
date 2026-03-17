import type { BannerType, RiskLevel, TriageResponse } from "@/lib/types/triage";

const RISK_LEVELS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH"];
const BANNER_TYPES: BannerType[] = ["STOP_VERIFY", "VERIFY_FIRST", "PROCEED_SAFER"];

export function parseTriageResponse(payload: string): TriageResponse | null {
  try {
    const parsed = JSON.parse(payload) as unknown;
    return isTriageResponse(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function isTriageResponse(value: unknown): value is TriageResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRiskLevel(value.risk_level) &&
    typeof value.confidence === "number" &&
    value.confidence >= 0 &&
    value.confidence <= 1 &&
    isRecord(value.banner) &&
    isBannerType(value.banner.type) &&
    typeof value.banner.message === "string" &&
    Array.isArray(value.reasons) &&
    value.reasons.every(isReason) &&
    Array.isArray(value.action_steps) &&
    value.action_steps.every((item) => typeof item === "string") &&
    isRecord(value.templates) &&
    typeof value.templates.verify_message === "string" &&
    typeof value.templates.platform_report === "string" &&
    typeof value.templates.containment_steps === "string" &&
    isRecord(value.cod_log) &&
    typeof value.cod_log.roundA === "string" &&
    typeof value.cod_log.roundB === "string" &&
    typeof value.cod_log.roundC === "string" &&
    typeof value.cod_log.supervisor === "string"
  );
}

function isReason(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    typeof value.evidence_snippet === "string" &&
    Array.isArray(value.guidance_links) &&
    value.guidance_links.every((item) => typeof item === "string") &&
    typeof value.notes === "string"
  );
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === "string" && RISK_LEVELS.includes(value as RiskLevel);
}

function isBannerType(value: unknown): value is BannerType {
  return typeof value === "string" && BANNER_TYPES.includes(value as BannerType);
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}
