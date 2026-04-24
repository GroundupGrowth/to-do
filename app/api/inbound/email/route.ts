import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Postmark Inbound webhook handler.
// Docs: https://postmarkapp.com/developer/user-guide/inbound/parse-an-email
//
// Setup:
// 1. Point Postmark's Inbound Webhook URL at:
//      https://<your-domain>/api/inbound/email?token=<POSTMARK_INBOUND_SECRET>
// 2. Set POSTMARK_INBOUND_SECRET in Vercel project env vars.
// 3. Emails to your inbound address become to-do cards automatically.
//
// Routing rules:
//  - If the subject starts with "[ClientName]" (case-insensitive, matches an
//    existing client by name), the todo is created under that client.
//  - Otherwise it lands in the auto-created "Inbox" client.
//  - The email body is stored as a todo note so the full message is preserved.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PostmarkInbound = {
  From?: string;
  FromName?: string;
  Subject?: string;
  TextBody?: string;
  HtmlBody?: string;
  StrippedTextReply?: string;
  MessageID?: string;
};

const INBOX_NAME = "Inbox";
const MAX_TITLE_LEN = 140;
const MAX_BODY_LEN = 20_000;

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const expected = process.env.POSTMARK_INBOUND_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "Server is missing POSTMARK_INBOUND_SECRET" },
      { status: 500 },
    );
  }
  if (!token || !timingSafeEqual(token, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: PostmarkInbound;
  try {
    payload = (await request.json()) as PostmarkInbound;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawSubject = (payload.Subject ?? "").trim();
  const fromName = (payload.FromName || payload.From || "").trim();
  const bodyText =
    payload.StrippedTextReply?.trim() ||
    payload.TextBody?.trim() ||
    stripHtml(payload.HtmlBody ?? "") ||
    "";

  if (!rawSubject && !bodyText) {
    return NextResponse.json(
      { error: "Email has no subject or body" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // Detect [ClientName] prefix in subject
  const prefixMatch = rawSubject.match(/^\[([^\]]+)\]\s*(.*)$/);
  let clientId: string | null = null;
  let title = rawSubject || "(no subject)";

  if (prefixMatch) {
    const tag = prefixMatch[1].trim();
    const rest = prefixMatch[2].trim();
    const { data: match } = await supabase
      .from("clients")
      .select("id")
      .ilike("name", tag)
      .maybeSingle();
    if (match?.id) {
      clientId = match.id;
      title = rest || rawSubject;
    }
  }

  if (!clientId) {
    clientId = await ensureInboxClient(supabase);
  }

  const todoTitle = truncate(title, MAX_TITLE_LEN);

  const { data: todo, error: insertErr } = await supabase
    .from("todos")
    .insert({
      client_id: clientId,
      title: todoTitle,
      status: "todo",
    })
    .select("id")
    .single();

  if (insertErr || !todo) {
    return NextResponse.json(
      { error: insertErr?.message ?? "Failed to create todo" },
      { status: 500 },
    );
  }

  if (bodyText || fromName) {
    const noteBody = composeNoteBody({
      fromName,
      subject: rawSubject,
      body: bodyText,
    });
    await supabase.from("todo_notes").insert({
      todo_id: todo.id,
      author: null,
      body: truncate(noteBody, MAX_BODY_LEN),
    });
  }

  return NextResponse.json({ ok: true, todo_id: todo.id });
}

async function ensureInboxClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const existing = await supabase
    .from("clients")
    .select("id")
    .eq("name", INBOX_NAME)
    .maybeSingle();
  if (existing.data?.id) return existing.data.id;

  const created = await supabase
    .from("clients")
    .insert({
      name: INBOX_NAME,
      description: "Emails forwarded to the inbound address land here.",
    })
    .select("id")
    .single();
  if (created.error || !created.data) {
    throw new Error(created.error?.message ?? "Failed to create Inbox client");
  }
  return created.data.id;
}

function composeNoteBody({
  fromName,
  subject,
  body,
}: {
  fromName: string;
  subject: string;
  body: string;
}): string {
  const lines: string[] = [];
  if (fromName) lines.push(`From: ${fromName}`);
  if (subject) lines.push(`Subject: ${subject}`);
  if (lines.length) lines.push("");
  lines.push(body);
  return lines.join("\n").trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
