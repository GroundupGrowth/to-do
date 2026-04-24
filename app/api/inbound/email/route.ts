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

type PostmarkAttachment = {
  Name?: string;
  ContentType?: string;
  ContentLength?: number;
};

type PostmarkInbound = {
  From?: string;
  FromName?: string;
  Date?: string;
  Subject?: string;
  TextBody?: string;
  HtmlBody?: string;
  MessageID?: string;
  Attachments?: PostmarkAttachment[];
};

const INBOX_NAME = "Inbox";
const MAX_TITLE_LEN = 140;
const MAX_BODY_LEN = 60_000;

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
  const fromEmail = (payload.From ?? "").trim();
  const dateStr = (payload.Date ?? "").trim();
  // Prefer TextBody so forwarded / quoted content is preserved. Fall back to
  // stripped HTML only if there's literally no text version (unusual).
  const bodyText =
    payload.TextBody?.trim() ||
    stripHtml(payload.HtmlBody ?? "").trim() ||
    "";
  const attachments = (payload.Attachments ?? []).filter((a) => a.Name);

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

  if (bodyText || fromName || attachments.length > 0) {
    const noteBody = composeNoteBody({
      fromName,
      fromEmail,
      dateStr,
      subject: rawSubject,
      body: bodyText,
      attachments,
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
  fromEmail,
  dateStr,
  subject,
  body,
  attachments,
}: {
  fromName: string;
  fromEmail: string;
  dateStr: string;
  subject: string;
  body: string;
  attachments: PostmarkAttachment[];
}): string {
  const lines: string[] = [];

  const fromLine =
    fromName && fromEmail && fromName !== fromEmail
      ? `${fromName} <${fromEmail}>`
      : fromName || fromEmail;
  if (fromLine) lines.push(`From: ${fromLine}`);
  if (dateStr) lines.push(`Date: ${dateStr}`);
  if (subject) lines.push(`Subject: ${subject}`);

  if (lines.length) lines.push("", "---", "");
  if (body) lines.push(body);

  if (attachments.length > 0) {
    lines.push("", "Attachments:");
    for (const a of attachments) {
      const size = a.ContentLength ? ` (${formatSize(a.ContentLength)})` : "";
      lines.push(`  • ${a.Name}${size}`);
    }
  }

  return lines.join("\n").trim();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
