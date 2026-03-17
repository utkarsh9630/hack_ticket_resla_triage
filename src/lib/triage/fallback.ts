import type {
  BannerType,
  NormalizedTriageRequest,
  RiskLevel,
  TriageReason,
  TriageResponse,
} from "@/lib/types/triage";

const GUIDANCE_LINKS = {
  ftcBots: "https://www.ftc.gov/legal-library/browse/statutes/better-online-ticket-sales-act",
  ftcEnforcement:
    "https://www.ftc.gov/news-events/news/press-releases/2025/08/ftc-takes-action-against-ticket-resellers-using-illegal-tactics-bypass-ticket-limit-protections",
  ticketmaster: "https://blog.ticketmaster.com/ticketing-scams-tips-best-practices/",
  bbb: "https://www.bbb.org/article/news-releases/26662-bbb-tip-what-to-know-about-buying-tickets-from-an-online-reseller",
} as const;

const OFF_PLATFORM_KEYWORDS = ["whatsapp", "telegram", "text me", "dm me", "instagram", "call me"];
const URGENCY_KEYWORDS = ["asap", "right now", "10 minutes", "few minutes", "urgent", "immediately"];
const PAYMENT_KEYWORDS = ["zelle", "venmo", "wire", "gift card", "cash app", "apple cash", "crypto"];

type Signal = {
  key: "off_platform" | "urgency" | "payment";
  score: number;
  evidence: string;
};

export function buildFallbackTriage(input: NormalizedTriageRequest): TriageResponse {
  const signals = collectSignals(input);
  const riskLevel = determineRiskLevel(signals);
  const confidence = determineConfidence(signals);

  return {
    risk_level: riskLevel,
    confidence,
    banner: buildBanner(riskLevel),
    reasons: buildReasons(input, signals, riskLevel),
    action_steps: buildActionSteps(riskLevel),
    templates: {
      verify_message:
        "Hi, before paying I want to keep communication on-platform and verify the transfer method through the platform's official process.",
      platform_report:
        "This ticket listing includes risk indicators such as payment pressure, off-platform communication, or urgency. Please review it for buyer safety.",
      containment_steps:
        "If you already paid, contact the platform and your payment provider immediately, save screenshots, and stop further payment until the situation is verified.",
    },
    cod_log: {
      roundA: "Fallback triage identified known ticket-resale risk signals from the user text and structured toggles.",
      roundB: "Safety review avoided accusations and prioritized evidence-backed caution rather than certainty.",
      roundC: "Recommended next steps were revised to focus on verification, buyer protection, and containment if money was already sent.",
      supervisor: `Final fallback decision set ${riskLevel} risk based on combined off-platform, urgency, and payment-risk indicators.`,
    },
  };
}

function collectSignals(input: NormalizedTriageRequest): Signal[] {
  const haystack = `${input.text.toLowerCase()} ${input.payment_method.toLowerCase()} ${input.platform.toLowerCase()}`;
  const signals: Signal[] = [];

  if (input.off_platform || includesAny(haystack, OFF_PLATFORM_KEYWORDS)) {
    signals.push({
      key: "off_platform",
      score: 2,
      evidence: findEvidence(input, OFF_PLATFORM_KEYWORDS) ?? "Communication appears to be moving off-platform.",
    });
  }

  if (input.urgency || includesAny(haystack, URGENCY_KEYWORDS)) {
    signals.push({
      key: "urgency",
      score: 1,
      evidence: findEvidence(input, URGENCY_KEYWORDS) ?? "The seller is applying time pressure to complete payment quickly.",
    });
  }

  if (includesAny(haystack, PAYMENT_KEYWORDS)) {
    signals.push({
      key: "payment",
      score: 2,
      evidence: findEvidence(input, PAYMENT_KEYWORDS) ?? "The request mentions a payment method with weaker buyer protections.",
    });
  }

  return signals;
}

function determineRiskLevel(signals: Signal[]): RiskLevel {
  const score = signals.reduce((sum, signal) => sum + signal.score, 0);

  if (score >= 4) {
    return "HIGH";
  }

  if (score >= 2) {
    return "MEDIUM";
  }

  return "LOW";
}

function determineConfidence(signals: Signal[]): number {
  const score = signals.reduce((sum, signal) => sum + signal.score, 0);
  return Math.min(0.95, Math.max(0.35, 0.35 + score * 0.12));
}

function buildBanner(riskLevel: RiskLevel): { type: BannerType; message: string } {
  if (riskLevel === "HIGH") {
    return {
      type: "STOP_VERIFY",
      message: "Stop and verify before paying. Multiple risk indicators suggest this transaction needs extra caution.",
    };
  }

  if (riskLevel === "MEDIUM") {
    return {
      type: "VERIFY_FIRST",
      message: "Verify the seller, transfer method, and payment protections before moving forward.",
    };
  }

  return {
    type: "PROCEED_SAFER",
    message: "No major red flags were detected, but continue with platform-safe payment and verification steps.",
  };
}

function buildReasons(
  input: NormalizedTriageRequest,
  signals: Signal[],
  riskLevel: RiskLevel,
): TriageReason[] {
  const reasons: TriageReason[] = [];

  for (const signal of signals) {
    if (signal.key === "off_platform") {
      reasons.push({
        title: "Off-platform communication pressure",
        evidence_snippet: signal.evidence,
        guidance_links: [GUIDANCE_LINKS.ticketmaster, GUIDANCE_LINKS.bbb],
        notes: "Moving the transaction away from the official platform can reduce buyer protections and make disputes harder.",
      });
    }

    if (signal.key === "urgency") {
      reasons.push({
        title: "Urgency language",
        evidence_snippet: signal.evidence,
        guidance_links: [GUIDANCE_LINKS.bbb],
        notes: "Time pressure is a common tactic used to push buyers past verification steps.",
      });
    }

    if (signal.key === "payment") {
      reasons.push({
        title: "Potentially risky payment method",
        evidence_snippet: signal.evidence,
        guidance_links: [GUIDANCE_LINKS.ticketmaster, GUIDANCE_LINKS.ftcEnforcement],
        notes: "Some payment methods are difficult to reverse or dispute if the tickets are not legitimate.",
      });
    }
  }

  if (reasons.length === 0) {
    reasons.push({
      title: "Limited direct risk signals",
      evidence_snippet: excerpt(input.text),
      guidance_links: [GUIDANCE_LINKS.ticketmaster],
      notes: "The message does not show strong scam indicators, but authenticity still cannot be guaranteed.",
    });
  }

  if (reasons.length < 3) {
    reasons.push({
      title: "Verification still matters",
      evidence_snippet:
        riskLevel === "LOW"
          ? "Even lower-risk listings should be verified through official transfer and payment channels."
          : "The available information is incomplete, so verification steps remain important before paying.",
      guidance_links: [GUIDANCE_LINKS.bbb, GUIDANCE_LINKS.ticketmaster],
      notes: "Ticket resale safety depends on keeping proof, using protected payments, and confirming transfer details.",
    });
  }

  if (reasons.length < 3) {
    reasons.push({
      title: "Use authoritative platform guidance",
      evidence_snippet: "Official consumer-protection and platform guidance recommend safer verification and payment practices.",
      guidance_links: [GUIDANCE_LINKS.ftcBots, GUIDANCE_LINKS.ticketmaster, GUIDANCE_LINKS.bbb],
      notes: "This tool provides educational triage and should be combined with platform-specific verification.",
    });
  }

  return reasons.slice(0, 3);
}

function buildActionSteps(riskLevel: RiskLevel): string[] {
  if (riskLevel === "HIGH") {
    return [
      "Keep all communication on the original ticket platform.",
      "Do not pay until the seller identity and transfer method are verified.",
      "Use a payment method with buyer protection only.",
      "Save screenshots of messages, payment requests, and listing details.",
      "Report the listing if the seller continues to push off-platform or urgent payment.",
    ];
  }

  if (riskLevel === "MEDIUM") {
    return [
      "Ask the seller to complete the transaction through the official platform flow.",
      "Confirm how the ticket transfer will occur before paying.",
      "Avoid irreversible payment methods if buyer protection is unclear.",
      "Save screenshots in case you need to report the listing later.",
    ];
  }

  return [
    "Use the platform's official payment and transfer flow.",
    "Verify the event details and transfer process before paying.",
    "Keep screenshots and confirmation messages until the tickets are secured.",
  ];
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

function findEvidence(input: NormalizedTriageRequest, keywords: string[]): string | null {
  const lowerText = input.text.toLowerCase();

  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword);
    if (index !== -1) {
      const rawStart = Math.max(0, index - 30);
      const rawEnd = Math.min(input.text.length, index + keyword.length + 30);
      const snippet = input.text.slice(rawStart, rawEnd).trim();
      return cleanSnippet(snippet);
    }
  }

  return null;
}

function excerpt(text: string): string {
  return text.length > 140 ? `${text.slice(0, 137)}...` : text;
}

function cleanSnippet(value: string): string {
  return value
    .replace(/^[^\w$]+/, "")
    .replace(/[^\w.)!?]+$/, "")
    .trim();
}
