import { NextResponse } from "next/server";

import { requestNemotronTriage } from "@/lib/llm/nimClient";
import { buildFallbackTriage } from "@/lib/triage/fallback";
import { normalizeTriageRequest, hasUsableText } from "@/lib/triage/normalize";
import { parseTriageResponse } from "@/lib/triage/validate";
import type { TriageErrorResponse, TriageRequest } from "@/lib/types/triage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: TriageRequest;

  try {
    body = (await request.json()) as TriageRequest;
  } catch {
    return NextResponse.json<TriageErrorResponse>(
      {
        error: "INVALID_JSON",
        message: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  const normalized = normalizeTriageRequest(body);

  if (!hasUsableText(normalized.text)) {
    return NextResponse.json<TriageErrorResponse>(
      {
        error: "TEXT_REQUIRED",
        message: "Please provide more detail from the listing or seller chat so TicketGuard can triage the risk.",
      },
      { status: 400 },
    );
  }

  const fallback = buildFallbackTriage(normalized);

  try {
    const raw = await requestNemotronTriage(normalized);
    const parsed = parseTriageResponse(raw);

    if (!parsed) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(fallback);
  }
}
