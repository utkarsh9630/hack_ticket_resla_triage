// This file replaces the runtime fs.readdir/readFile of data/guidance/*.md
// Bundled at build time so it works on Vercel serverless functions.

export const GUIDANCE_CONTEXT = `FILE: bbb_reseller_safety.md
# BBB — Reseller and Online Purchase Safety Tips

## Summary

The Better Business Bureau (BBB) provides guidance on avoiding scams when buying from resellers or online sellers. Themes include: verify the seller, keep transactions traceable, use secure payment methods, and watch for red flags like urgency and off-platform moves.

## Key tips (BBB-style guidance)

- **Verify the seller.** Check reviews, BBB profile, and how long they've been active. Be extra cautious with new or unverifiable sellers.
- **Prefer secure, traceable payment.** Payment methods with buyer protection or dispute options are safer than cash, wire, or certain P2P apps when buying from strangers.
- **Stay on the platform.** Completing the deal through the platform's messaging and payment can help with records and recourse. Be cautious if the seller pushes to move to text, WhatsApp, or email to pay.
- **Watch for urgency and pressure.** "Pay in 10 minutes," "last one," or "someone else is buying now" are common pressure tactics. Take time to verify.
- **Get details in writing.** Event name, date, section, seat, price, and transfer method. Mismatches or vagueness are red flags.
- **If you already paid and something's wrong,** contact the platform and your payment provider immediately. Document everything.

## Links

- BBB: https://www.bbb.org/
- BBB scam tips and consumer resources: https://www.bbb.org/all/consumer-tips

## Use in TicketGuard

Use for reasons and guidance_links when the input involves: unverified sellers, payment method risk, off-platform pressure, urgency, or need for containment steps after payment. Keep tone practical and non-accusatory.

---

FILE: ftc_bots_act.md
# FTC BOTS Act — Relevant to Ticket Purchases

## Summary

The Better Online Ticket Sales (BOTS) Act of 2016 makes it illegal to use software (bots) to circumvent control measures used by ticket sellers to ensure fair access to tickets. It also prohibits selling tickets that were obtained in violation of those measures.

## Relevance for fans

- **Legitimate resale**: Resale itself is not banned; buying from another fan or a licensed reseller is legal when no BOTS-act violation is involved.
- **Platform rules**: Marketplaces (StubHub, Ticketmaster, etc.) have their own rules about how tickets are listed and transferred. Following platform rules and keeping transactions on-platform helps avoid both BOTS and fraud issues.
- **Red flags**: Offers that bypass the platform's official transfer or checkout process may increase risk of fraud or non-delivery, even when the BOTS Act isn't directly at issue.

## Links

- FTC BOTS Act: https://www.ftc.gov/legal-library/browse/statutes/better-online-ticket-sales-act-2016
- FTC consumer info: https://www.ftc.gov/

## Use in TicketGuard

When risk involves unclear or off-platform ticket transfer, you can cite the FTC and BOTS Act context to encourage on-platform, rule-compliant behavior and to point users to official FTC resources.

---

FILE: ftc_ticket_reseller_enforcement.md
# FTC Enforcement — Ticket Resellers and Deceptive Practices

## Summary

The FTC has taken action against ticket resellers and related businesses for deceptive practices, including misleading consumers about ticket availability, fees, and the nature of the seller.

## What the FTC cares about

- **Deceptive claims**: False or misleading statements about tickets, prices, fees, or seller identity.
- **Unfair practices**: Practices that cause or are likely to cause substantial injury that consumers cannot reasonably avoid.
- **BOTS Act violations**: Use of software to circumvent ticket seller controls, or selling tickets obtained that way.

## Relevance for fans

- Buying from unknown sellers off-platform increases the chance of deception (fake tickets, no delivery, hidden fees). Staying on-platform and using the platform's payment and transfer tools can reduce risk.
- If a fan is pressured to pay outside the platform or to rush payment, that aligns with patterns the FTC has addressed in enforcement—not as a guarantee of a specific violation, but as a reason to be cautious and to prefer platform-mediated transactions.

## Links

- FTC enforcement: https://www.ftc.gov/
- FTC consumer advice (scams, shopping): https://consumer.ftc.gov/

## Use in TicketGuard

Cite FTC enforcement and consumer resources when recommending that users keep transactions on-platform, verify sellers, and avoid rushed or off-platform payment pressure. Use for guidance_links in reasons related to deception, pressure, or off-platform payment.

---

FILE: ticketmaster_scam_prevention.md
# Ticketmaster — Scam Prevention Tips

## Summary

Ticketmaster and other primary sellers publish tips to help fans avoid ticket and resale scams. Key themes: buy from trusted sources, keep transactions on-platform, verify transfer methods, and be wary of urgency and off-platform pressure.

## Key tips (paraphrased from Ticketmaster guidance)

- **Buy from official or trusted sources** when possible. If using resale, prefer the platform's own resale or verified channels.
- **Keep communication and payment on the platform.** Be cautious if the seller wants to move to text, WhatsApp, or email to complete the deal.
- **Verify how tickets will be transferred** (e.g. official transfer link, account-to-account) and that the method matches what the platform supports.
- **Avoid payment methods that are hard to reverse** (e.g. wire, cash, some P2P apps) when the platform offers its own checkout with buyer protection.
- **Be wary of urgency** ("last ticket," "pay now or I'll sell to someone else"). Scammers often use time pressure.
- **Check the listing details** (event, date, section, seat) and make sure they match what you expect. Report listings that look fake or misleading.

## Links

- Ticketmaster scam prevention and best practices: https://blog.ticketmaster.com/ticketing-scams-tips-best-practices/
- Ticketmaster help / safety: https://help.ticketmaster.com/

## Use in TicketGuard

Use for reasons and guidance_links when the input mentions: off-platform payment, urgency, unsafe payment methods, or need to verify transfer method. Keep language aligned with "tips" and "best practices," not legal conclusions.`;
