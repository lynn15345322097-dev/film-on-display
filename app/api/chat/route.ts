import { NextResponse } from "next/server";

import { fmWorkbenchContext } from "@/components/archive/fm-content";
import { createClient } from "@/lib/supabase/server";

const DEEPSEEK_CHAT_COMPLETIONS_URL = "https://api.deepseek.com/chat/completions";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";

  if (!apiKey) {
    return NextResponse.json(
      { error: "DeepSeek API key is not configured." },
      { status: 500 },
    );
  }

  let payload: { messages?: IncomingMessage[] };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = Array.isArray(payload.messages)
    ? payload.messages
        .filter(
          (message) =>
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string" &&
            message.content.trim().length > 0,
        )
        .slice(-12)
    : [];

  if (!messages.length) {
    return NextResponse.json({ error: "At least one message is required." }, { status: 400 });
  }

  const response = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: [
            "You are an archival research assistant for FILM ON DISPLAY 影像展陈.",
            "Help with film heritage, GIS archive exploration, photo metadata, and technical classification. Be concise, scholarly, and clear. Do not claim to have written database records.",
            `Current local research dataset: ${fmWorkbenchContext.stats.museums} exhibition spaces, ${fmWorkbenchContext.stats.photos} photo metadata records, ${fmWorkbenchContext.stats.exhibitions} curated research routes, ${fmWorkbenchContext.stats.provinces} provinces, ${fmWorkbenchContext.stats.cities} cities, ${fmWorkbenchContext.stats.visited} field-visited sites.`,
            `Top provinces by record count: ${fmWorkbenchContext.topProvinces.map((item) => `${item.label} ${item.count}`).join(", ")}.`,
            `Research routes: ${fmWorkbenchContext.routeTitles.join("；")}.`,
          ].join("\n"),
        },
        ...messages,
      ],
      temperature: 0.4,
      max_tokens: 700,
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      {
        error: "DeepSeek request failed.",
        detail: detail.slice(0, 500),
      },
      { status: response.status },
    );
  }

  const completion = await response.json();
  const content = completion?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { error: "DeepSeek returned an empty response." },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: content.trim(), model });
}
