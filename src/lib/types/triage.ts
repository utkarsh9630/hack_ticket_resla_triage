export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type BannerType = "STOP_VERIFY" | "VERIFY_FIRST" | "PROCEED_SAFER";

export type TriageRequest = {
  text: string;
  platform?: string;
  payment_method?: string;
  off_platform?: boolean;
  urgency?: boolean;
};

export type NormalizedTriageRequest = {
  text: string;
  platform: string;
  payment_method: string;
  off_platform: boolean;
  urgency: boolean;
};

export type TriageReason = {
  title: string;
  evidence_snippet: string;
  guidance_links: string[];
  notes: string;
};

export type TriageTemplates = {
  verify_message: string;
  platform_report: string;
  containment_steps: string;
};

export type TriageCodLog = {
  roundA: string;
  roundB: string;
  roundC: string;
  supervisor: string;
};

export type TriageResponse = {
  risk_level: RiskLevel;
  confidence: number;
  banner: {
    type: BannerType;
    message: string;
  };
  reasons: TriageReason[];
  action_steps: string[];
  templates: TriageTemplates;
  cod_log: TriageCodLog;
};

export type TriageErrorResponse = {
  error: string;
  message: string;
};
