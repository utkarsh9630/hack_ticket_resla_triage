import type { TriageRequest } from "@/lib/types/triage";

export const triageTestCases: Record<string, TriageRequest> = {
  obviousScam: {
    text: "2 Taylor Swift tickets, can transfer fast, message me on WhatsApp, Venmo only, need payment in 10 minutes.",
    platform: "Facebook Marketplace",
    payment_method: "Venmo",
    off_platform: true,
    urgency: true,
  },
  saferCase: {
    text: "Selling two tickets, happy to transfer through Ticketmaster after payment using PayPal Goods and Services.",
    platform: "Ticketmaster",
    payment_method: "PayPal Goods and Services",
    off_platform: false,
    urgency: false,
  },
  vagueCase: {
    text: "Selling tickets tonight. DM if interested.",
    platform: "Instagram",
    payment_method: "",
    off_platform: false,
    urgency: false,
  },
};
