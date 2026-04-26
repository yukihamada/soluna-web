import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

// ── Festival knowledge base ──
const KB = {
  basics: `SOLUNA FEST HAWAII 2026
Date: September 4 (Fri) – 6 (Sun), 2026
Venue: Moanalua Gardens, Oahu, Hawaii
Gates open: 6:00 PM HST
Age limit: 21+ (valid ID required)
Official site: https://solun.art`,

  tickets: `Ticket Pricing:
- Day 1 (Sep 4): $120
- Day 2 (Sep 5): $180
- Day 1+2 Combo: $280
- VIP (2-day): $1,000+
- Early Bird sold out

VIP includes: Premium viewing area, dedicated VIP bar, express entry, exclusive lounge access

Buy tickets: https://solun.art/tickets`,

  lineup: `Artists: Underground electronic music artists performing across multiple stages.
Main Stage headliner: announced closer to the event.
Check https://solun.art/lineup for the latest artist announcements.`,

  schedule: `Timeline (each day):
- 18:00: Gates Open (ID check & bag inspection)
- 19:00: First Artist Starts
- 20:00: Main Stage Opens
- 23:00: Headliner Set
- 02:00: Closing Set
- 03:00: Finale & Shuttle Departs (last shuttle 03:30)`,

  guide: `What to bring:
✓ Government-issued photo ID (passport or driver's license) — REQUIRED
✓ Ticket QR code (screenshot recommended)
✓ Credit card / contactless payment
✓ Comfortable clothing and shoes
✓ Light jacket (nights can get cool)

NOT allowed:
✗ Outside food, drinks, or bottles
✗ Large bags or backpacks (small pouches only)
✗ Professional cameras with detachable lenses
✗ Tents or folding chairs
✗ Drugs or dangerous items

Transport:
- Shuttle Bus (Recommended): Round-trip from major Waikiki hotels (booking details TBA)
- Uber/Lyft: Use designated drop-off/pick-up zones
- Parking: Limited on-site parking available

No re-entry once you exit the venue.`,

  faq: `FAQ:
Q: When will the exact venue be revealed?
A: Ticket holders will receive the exact location by email one week before the event.

Q: Can I bring food or drinks?
A: No outside food/beverages. Vendors inside. SOLUNA is zero single-use plastic.

Q: What happens if it rains?
A: Outdoor event, proceeds in light rain. Cancellation announced via official SNS and email.

Q: Is there a refund policy?
A: Tickets are non-refundable. Contact support for exceptional circumstances.`,

  about: `About SOLUNA:
SOLUNA is a music festival and lifestyle brand created by Yuki Hamada (Enabler CEO, ex-Mercari CPO).
The vision: residences, experiences, and communities that remain in the world.
SOLUNA FEST HAWAII 2026 — underground electronic music, Sep 4-6, Oahu.
Creator: Yuki Hamada — https://yukihamada.jp`
};

function getContext(query: string): string {
  const q = query.toLowerCase();
  const parts: string[] = [];
  if (q.match(/ticket|price|buy|vip|購入|チケット|値段|料金/)) parts.push(KB.tickets);
  if (q.match(/schedule|timeline|time|when|何時|スケジュール|タイムライン/)) parts.push(KB.schedule);
  if (q.match(/lineup|artist|who|perform|アーティスト|ライン|出演/)) parts.push(KB.lineup);
  if (q.match(/bring|transport|shuttle|uber|bag|持|交通|シャトル|バッグ/)) parts.push(KB.guide);
  if (q.match(/faq|refund|rain|entry|再入場|返金|雨/)) parts.push(KB.faq);
  if (q.match(/about|soluna|what is|とは|概要|creator|yuki/)) parts.push(KB.about);
  if (parts.length === 0) parts.push(KB.basics, KB.tickets, KB.guide);
  else parts.unshift(KB.basics);
  return parts.join("\n\n");
}

function mcpText(text: string) {
  return { content: [{ type: "text", text }] };
}

async function handleMethod(method: string, params: any): Promise<[any, number?]> {
  switch (method) {
    case "initialize":
      return [{ protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "soluna-fest", version: "1.0.0" } }];
    case "notifications/initialized":
    case "ping":
      return [{}];
    case "tools/list":
      return [{
        tools: [
          { name: "get_festival_info", description: "Get basic festival information: dates, venue, tickets, age limit.", inputSchema: { type: "object", properties: {} } },
          { name: "get_tickets", description: "Get ticket types, pricing, VIP packages, and purchase link.", inputSchema: { type: "object", properties: {} } },
          { name: "get_lineup", description: "Get artist lineup and performance information.", inputSchema: { type: "object", properties: {} } },
          { name: "get_schedule", description: "Get daily event timeline and schedule.", inputSchema: { type: "object", properties: {} } },
          { name: "get_guide", description: "Get attendee guide: what to bring, transport, rules.", inputSchema: { type: "object", properties: {} } },
          { name: "get_faq", description: "Get frequently asked questions and answers.", inputSchema: { type: "object", properties: {} } },
          {
            name: "ask_soluna",
            description: "Ask any question about SOLUNA FEST HAWAII 2026. AI answers using festival knowledge base.",
            inputSchema: { type: "object", properties: { question: { type: "string", description: "Your question" } }, required: ["question"] }
          }
        ]
      }];
    case "tools/call": {
      const name = params?.name ?? "";
      const args = params?.arguments ?? {};
      switch (name) {
        case "get_festival_info": return [mcpText(KB.basics)];
        case "get_tickets": return [mcpText(KB.tickets)];
        case "get_lineup": return [mcpText(KB.lineup)];
        case "get_schedule": return [mcpText(KB.schedule)];
        case "get_guide": return [mcpText(KB.guide)];
        case "get_faq": return [mcpText(KB.faq)];
        case "ask_soluna": {
          const question = args.question ?? "";
          const apiKey = process.env.ANTHROPIC_API_KEY;
          if (!apiKey) return [mcpText("AI not configured. Refer to https://solun.art for information.")];
          const context = getContext(question);
          const system = `You are an AI assistant for SOLUNA FEST HAWAII 2026 (solun.art).
Answer questions about the festival concisely. Use the knowledge base below.
Answer in the same language as the question (Japanese or English).
Do not use markdown formatting.

Knowledge Base:
${context}`;
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
            body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 512, system, messages: [{ role: "user", content: question }] }),
            signal: AbortSignal.timeout(30000),
          });
          const data = await res.json();
          const text = data?.content?.[0]?.text ?? "Sorry, I couldn't answer that.";
          return [mcpText(text)];
        }
        default:
          return [null, -32602];
      }
    }
    default:
      return [null, -32601];
  }
}

async function processReq(req: any): Promise<any> {
  const id = req.id ?? null;
  const [result, errCode] = await handleMethod(req.method, req.params);
  if (errCode) {
    return { jsonrpc: "2.0", id, error: { code: errCode, message: errCode === -32601 ? "Method not found" : "Invalid params" } };
  }
  if (req.method === "notifications/initialized") return null;
  return { jsonrpc: "2.0", id, result };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  let response: any;
  if (Array.isArray(body)) {
    const results = (await Promise.all(body.map(processReq))).filter(Boolean);
    response = results;
  } else {
    response = await processReq(body);
    if (response === null) return new NextResponse(null, { status: 204, headers: CORS });
  }
  return NextResponse.json(response, { headers: CORS });
}

export async function GET() {
  return NextResponse.json({
    name: "SOLUNA FEST HAWAII 2026 MCP Server",
    endpoint: "https://solun.art/api/mcp",
    discovery: "https://solun.art/.well-known/mcp.json",
    tools: ["get_festival_info", "get_tickets", "get_lineup", "get_schedule", "get_guide", "get_faq", "ask_soluna"]
  }, { headers: CORS });
}
