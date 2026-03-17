"use client";

import { useEffect, useState } from "react";

import sampleInputs from "../../data/examples/sample_inputs.json";
import type { RiskLevel, TriageRequest, TriageResponse } from "@/lib/types/triage";

type DemoInput = TriageRequest & {
  id: string;
  label: string;
};

const EXAMPLES = sampleInputs as DemoInput[];
const STEPS = ["Retrieve Guidance", "Draft Plans", "Red-Team Check", "Supervisor Decision"];
const PRIMARY_EXAMPLES = ["killer_demo", "borderline_1", "low_risk_1"];

const INITIAL_FORM: TriageRequest = {
  text: EXAMPLES.find((entry) => entry.id === "killer_demo")?.text ?? "",
  platform: EXAMPLES.find((entry) => entry.id === "killer_demo")?.platform ?? "Facebook Marketplace",
  payment_method: EXAMPLES.find((entry) => entry.id === "killer_demo")?.payment_method ?? "Venmo",
  off_platform: EXAMPLES.find((entry) => entry.id === "killer_demo")?.off_platform ?? true,
  urgency: EXAMPLES.find((entry) => entry.id === "killer_demo")?.urgency ?? true,
};

const PLATFORM_OPTIONS = ["Facebook Marketplace", "Craigslist", "StubHub", "Ticketmaster", "Vivid Seats", "Other"];
const PAYMENT_OPTIONS = ["Venmo", "Zelle", "Cash", "Credit card", "PayPal", "Cash App", "Other"];

export default function HomePage() {
  const [form, setForm] = useState<TriageRequest>(INITIAL_FORM);
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [selectedExample, setSelectedExample] = useState("killer_demo");

  useEffect(() => {
    if (!loading) {
      setActiveStep(result ? STEPS.length - 1 : 0);
      return;
    }

    setActiveStep(0);
    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % STEPS.length);
    }, 700);

    return () => window.clearInterval(interval);
  }, [loading, result]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(""), 1200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as TriageResponse | { message?: string };

      if (!response.ok) {
        throw new Error(payload && typeof payload === "object" && "message" in payload ? payload.message : "Unable to run TicketGuard triage.");
      }

      setResult(payload as TriageResponse);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "TicketGuard could not complete the analysis.");
    } finally {
      setLoading(false);
    }
  }

  function applyExample(exampleId: string) {
    const example = EXAMPLES.find((entry) => entry.id === exampleId);
    if (!example) {
      return;
    }

    setSelectedExample(exampleId);
    setForm({
      text: example.text,
      platform: example.platform,
      payment_method: example.payment_method,
      off_platform: example.off_platform,
      urgency: example.urgency,
    });
    setError("");
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setCopied("");
    }
  }

  const riskLevel = result?.risk_level ?? "MEDIUM";
  const confidence = Math.round((result?.confidence ?? 0) * 100);

  return (
    <main className="shell">
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />

      <section className="simple-hero">
        <div>
          <h1>TicketGuard</h1>
          <p>Paste a resale listing or seller chat. TicketGuard checks for scam signals and returns the risk level, why it was flagged, and what to do next.</p>
        </div>
      </section>

      <section className="workspace">
        <div className="panel panel-form">
          <div className="panel-header compact-header">
            <div>
              <div className="panel-kicker">Input</div>
              <h2>What are we testing?</h2>
            </div>
          </div>

          <div className="intro-note">
            Test a real or sample seller message. Output: risk level, evidence-backed reasons, and next safe moves.
          </div>

          <form className="triage-form" onSubmit={handleSubmit}>
            <div className="example-strip">
              {PRIMARY_EXAMPLES.map((exampleId) => {
                const example = EXAMPLES.find((entry) => entry.id === exampleId);
                if (!example) {
                  return null;
                }

                return (
                  <button
                    className={`example-chip ${selectedExample === example.id ? "example-chip-active" : ""}`}
                    key={example.id}
                    onClick={() => applyExample(example.id)}
                    type="button"
                  >
                    {example.label}
                  </button>
                );
              })}
            </div>

            <label className="field">
              <span className="field-label">Listing or seller chat</span>
              <textarea
                className="field-input field-textarea"
                onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
                placeholder="Paste the listing, seller DM, off-platform request, or payment ask."
                rows={8}
                value={form.text}
              />
            </label>

            <div className="field-grid">
              <label className="field">
                <span className="field-label">Platform</span>
                <select
                  className="field-input"
                  onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value }))}
                  value={form.platform}
                >
                  {PLATFORM_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field-label">Payment method</span>
                <select
                  className="field-input"
                  onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value }))}
                  value={form.payment_method}
                >
                  {PAYMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="toggle-row">
              <Toggle
                checked={Boolean(form.off_platform)}
                label="Asked to go off-platform"
                onChange={(checked) => setForm((current) => ({ ...current, off_platform: checked }))}
              />
              <Toggle
                checked={Boolean(form.urgency)}
                label="Urgency / time pressure"
                onChange={(checked) => setForm((current) => ({ ...current, urgency: checked }))}
              />
            </div>

            <div className="submit-row">
              <button className="primary-button submit-button" disabled={loading} type="submit">
                {loading ? "Analyzing..." : "Run Scam Triage"}
              </button>
              <div className="helper-copy">This uses the real `/api/triage` route. It is not a fake demo screen.</div>
            </div>

            {error ? <div className="error-banner">{error}</div> : null}
          </form>
        </div>

        <div className="panel panel-output">
          <div className="panel-header compact-header">
            <div>
              <div className="panel-kicker">Output</div>
              <h2>What does it return?</h2>
            </div>
            <span className={`live-dot ${loading ? "live-dot-active" : ""}`}>{loading ? "Running" : "Ready"}</span>
          </div>

          <div className="output-summary">
            <span className={`risk-chip risk-chip-${riskLevel.toLowerCase()}`}>{result ? riskLevel : "WAITING"}</span>
            <strong>{result ? `${confidence}% confidence` : "Run analysis to see the risk level."}</strong>
            <p>
              {loading
                ? "TicketGuard is reviewing signals and building the final decision."
                : result?.banner.message ?? "You will get a risk decision, reasons, and action steps here."}
            </p>
          </div>

          <div className="pipeline-list compact-pipeline">
            {STEPS.map((step, index) => (
              <div className={`pipeline-step ${index < activeStep ? "done" : ""} ${index === activeStep ? "current" : ""}`} key={step}>
                <div className="pipeline-orb">
                  <span>{index < activeStep || (!loading && result && index === STEPS.length - 1) ? "✓" : index + 1}</span>
                </div>
                <div className="pipeline-copy">
                  <strong>{step}</strong>
                  <div className="pipeline-bar">
                    <span style={{ width: loading ? `${index <= activeStep ? 80 : 8}%` : `${result ? 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {result ? (
            <div className="quick-output">
              <div className="quick-output-row">
                <span>Decision</span>
                <strong>{result.banner.type.replaceAll("_", " ")}</strong>
              </div>
              <div className="quick-output-row">
                <span>Top signal</span>
                <strong>{result.reasons[0]?.title ?? "None yet"}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="results-grid">
        <div className="panel results-hero">
          <div className="panel-header compact-header">
            <div>
              <div className="panel-kicker">Result</div>
              <h2>Scam Detection Result</h2>
            </div>
            {result ? <span className={`risk-chip risk-chip-${riskLevel.toLowerCase()}`}>{riskLevel}</span> : null}
          </div>

          {result ? (
            <div className="risk-overview compact-overview">
              <RiskDial confidence={confidence} riskLevel={riskLevel} />
              <div className="banner-card">
                <span className="banner-label">Decision</span>
                <h3>{result.banner.type.replaceAll("_", " ")}</h3>
                <p>{result.banner.message}</p>
              </div>
            </div>
          ) : (
            <div className="empty-result">
              Paste a message and click <strong>Run Scam Triage</strong>. The result section will show:
              <ul>
                <li>risk level</li>
                <li>why it was flagged</li>
                <li>what the buyer should do next</li>
              </ul>
            </div>
          )}
        </div>

        {result ? (
          <>
            <div className="panel reasons-panel">
              <div className="panel-header compact-header">
                <div>
                  <div className="panel-kicker">Reasons</div>
                  <h2>Why It Was Flagged</h2>
                </div>
              </div>

              <div className="reasons-grid">
                {result.reasons.map((reason) => (
                  <article className="reason-card" key={reason.title}>
                    <span className="reason-index">{reason.title}</span>
                    <p className="reason-evidence">"{reason.evidence_snippet}"</p>
                    <p className="reason-notes">{reason.notes}</p>
                    <div className="guidance-links">
                      {reason.guidance_links.map((link) => (
                        <a href={link} key={link} rel="noreferrer" target="_blank">
                          {sourceLabel(link)}
                        </a>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel action-panel">
              <div className="panel-header compact-header">
                <div>
                  <div className="panel-kicker">Action</div>
                  <h2>What Should The Buyer Do?</h2>
                </div>
              </div>

              <div className="checklist">
                {result.action_steps.map((step) => (
                  <div className="check-item" key={step}>
                    <span className="check-mark">✓</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <details className="panel details-panel">
              <summary>
                <span>
                  <div className="panel-kicker">Templates</div>
                  <strong>Copy-ready responses</strong>
                </span>
                <span className="summary-hint">{copied ? `${copied} copied` : "Expand"}</span>
              </summary>
              <div className="details-grid">
                <TemplateCard
                  actionLabel="Copy"
                  body={result.templates.verify_message}
                  copied={copied === "Verify"}
                  onCopy={() => copyText("Verify", result.templates.verify_message)}
                  title="Verify seller"
                />
                <TemplateCard
                  actionLabel="Copy"
                  body={result.templates.platform_report}
                  copied={copied === "Report"}
                  onCopy={() => copyText("Report", result.templates.platform_report)}
                  title="Report to platform"
                />
                <TemplateCard
                  actionLabel="Copy"
                  body={result.templates.containment_steps}
                  copied={copied === "Containment"}
                  onCopy={() => copyText("Containment", result.templates.containment_steps)}
                  title="If money was already sent"
                />
              </div>
            </details>

            <details className="panel details-panel">
              <summary>
                <span>
                  <div className="panel-kicker">Reasoning</div>
                  <strong>How we decided</strong>
                </span>
                <span className="summary-hint">Expand</span>
              </summary>
              <div className="details-grid">
                <CodCard copy={result.cod_log.roundA} title="Round A" />
                <CodCard copy={result.cod_log.roundB} title="Round B" />
                <CodCard copy={result.cod_log.roundC} title="Round C" />
                <CodCard copy={result.cod_log.supervisor} title="Supervisor" />
              </div>
            </details>
          </>
        ) : null}
      </section>
    </main>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`toggle simple-toggle ${checked ? "toggle-checked" : ""}`}>
      <span className="toggle-label">{label}</span>
      <button
        aria-label={label}
        aria-pressed={checked}
        className="toggle-switch"
        onClick={(event) => {
          event.preventDefault();
          onChange(!checked);
        }}
        type="button"
      >
        <span />
      </button>
    </label>
  );
}

function RiskDial({ confidence, riskLevel }: { confidence: number; riskLevel: RiskLevel }) {
  return (
    <div className="risk-dial">
      <div className="dial-visual">
        <div className={`dial-ring dial-ring-${riskLevel.toLowerCase()}`}>
          <div className="dial-cutout" />
          <div className="dial-needle" style={{ transform: `translateX(-50%) rotate(${confidence * 1.35 - 65}deg)` }} />
        </div>
      </div>
      <div className="dial-copy">
        <span>Risk confidence</span>
        <strong>{confidence}%</strong>
      </div>
    </div>
  );
}

function TemplateCard({
  actionLabel,
  body,
  copied,
  onCopy,
  title,
}: {
  actionLabel: string;
  body: string;
  copied: boolean;
  onCopy: () => void;
  title: string;
}) {
  return (
    <article className="template-card">
      <div className="template-card-header">
        <strong>{title}</strong>
        <button className={`mini-button ${copied ? "mini-button-copied" : ""}`} onClick={onCopy} type="button">
          {copied ? "Copied" : actionLabel}
        </button>
      </div>
      <p>{body}</p>
    </article>
  );
}

function CodCard({ copy, title }: { copy: string; title: string }) {
  return (
    <div className="cod-card">
      <span>{title}</span>
      <p>{copy}</p>
    </div>
  );
}

function sourceLabel(link: string): string {
  if (link.includes("ftc.gov")) {
    return "FTC";
  }

  if (link.includes("bbb.org")) {
    return "BBB";
  }

  if (link.includes("ticketmaster")) {
    return "Ticketmaster";
  }

  return "Source";
}
