import { buildFallbackTriage } from "@/lib/triage/fallback";
import { normalizeTriageRequest } from "@/lib/triage/normalize";
import { triageTestCases } from "@/lib/triage/testCases";

for (const [name, input] of Object.entries(triageTestCases)) {
  const result = buildFallbackTriage(normalizeTriageRequest(input));
  console.log(`\n=== ${name} ===`);
  console.log(JSON.stringify(result, null, 2));
}
