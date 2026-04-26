import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  return NextResponse.json({
    name: "SOLUNA FEST HAWAII 2026",
    url: "https://solun.art/api/a2a",
    agentCard: "https://solun.art/.well-known/agent.json"
  }, { headers: CORS });
}

export async function POST(request: NextRequest) {
  const task = await request.json();
  const taskId = task?.id ?? "unknown";

  // Extract question from A2A message parts
  const question: string = (task?.message?.parts ?? [])
    .filter((p: any) => p.type === "text")
    .map((p: any) => p.text ?? "")
    .join(" ")
    .trim();

  if (!question) {
    return NextResponse.json({
      id: taskId,
      status: {
        state: "completed",
        message: { role: "agent", parts: [{ type: "text", text: "Please provide a question about SOLUNA FEST HAWAII 2026." }] }
      }
    }, { headers: CORS });
  }

  // Call own MCP ask_soluna tool
  const mcpRes = await fetch(new URL("/api/mcp", request.url).toString(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1,
      method: "tools/call",
      params: { name: "ask_soluna", arguments: { question } }
    })
  });

  let answer = "Sorry, I couldn't answer that question.";
  try {
    const data = await mcpRes.json();
    answer = data?.result?.content?.[0]?.text ?? answer;
  } catch (_) {}

  return NextResponse.json({
    id: taskId,
    status: {
      state: "completed",
      message: { role: "agent", parts: [{ type: "text", text: answer }] }
    }
  }, { headers: CORS });
}
