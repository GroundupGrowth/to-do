"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Assignee, TodoNote, TodoStatus } from "@/lib/types";

export async function createTodo(input: {
  title: string;
  clientId: string;
  status?: TodoStatus;
}) {
  const title = input.title.trim();
  if (!title) throw new Error("Title is required");
  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .insert({
      title,
      client_id: input.clientId,
      status: input.status ?? "todo",
      triaged_at: new Date().toISOString(),
    });
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${input.clientId}`);
}

export async function triageTodo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .update({ triaged_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
}

export async function deleteTodo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
}

export async function fetchTodoNotes(todoId: string): Promise<TodoNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todo_notes")
    .select("*")
    .eq("todo_id", todoId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TodoNote[];
}

export async function updateTodoTitle(id: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Title is required");
  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .update({ title: trimmed })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
}

export async function addTodoNote(input: {
  todoId: string;
  author: Assignee | null;
  body: string;
}) {
  const body = input.body.trim();
  if (!body) throw new Error("Note body is required");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todo_notes")
    .insert({ todo_id: input.todoId, author: input.author, body })
    .select("*")
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
  return data;
}

export async function deleteTodoNote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("todo_notes").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
}

export async function assignTodo(id: string, assignee: Assignee | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .update({ assignee })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
}

export async function updateTodoStatus(id: string, status: TodoStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
}

export async function completeTodo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .update({ done: true, completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
}

export async function createClientRecord(input: {
  name: string;
  description?: string;
  tags?: string[];
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Name is required");
  const description = input.description?.trim() || null;
  const tags = (input.tags ?? [])
    .map((t) => t.trim())
    .filter(Boolean);
  // Dedupe case-insensitively, keep first casing.
  const seen = new Set<string>();
  const cleanTags: string[] = [];
  for (const t of tags) {
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleanTags.push(t);
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ name, description, tags: cleanTags })
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function deleteClient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  redirect("/clients");
}

export async function setClientTags(id: string, tags: string[]) {
  // Trim, dedupe (case-insensitive), preserve original casing of first occurrence.
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const raw of tags) {
    const t = raw.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    clean.push(t);
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ tags: clean })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}

export async function updateClientName(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ name: trimmed })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}

export async function updateClientNotes(id: string, notes: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ notes })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/clients/${id}`);
}

export async function createLink(input: {
  clientId: string;
  label: string;
  url: string;
}) {
  const label = input.label.trim();
  const url = input.url.trim();
  if (!label || !url) throw new Error("Label and URL required");
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const supabase = await createClient();
  const { error } = await supabase
    .from("links")
    .insert({ client_id: input.clientId, label, url: normalized });
  if (error) throw error;
  revalidatePath("/clients");
  revalidatePath(`/clients/${input.clientId}`);
}

export async function deleteLink(id: string, clientId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}

// ---- Onboarding ----

export async function createOnboardingStep(input: {
  title: string;
  description?: string;
}) {
  const title = input.title.trim();
  if (!title) throw new Error("Title is required");
  const description = input.description?.trim() || null;
  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("onboarding_steps")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;
  const { error } = await supabase
    .from("onboarding_steps")
    .insert({ title, description, position });
  if (error) throw error;
  revalidatePath("/onboarding");
}

export async function updateOnboardingStep(
  id: string,
  patch: { title?: string; description?: string | null },
) {
  const update: { title?: string; description?: string | null } = {};
  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) throw new Error("Title is required");
    update.title = t;
  }
  if (patch.description !== undefined) {
    update.description = patch.description?.trim() || null;
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_steps")
    .update(update)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/onboarding");
}

export async function deleteOnboardingStep(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_steps")
    .delete()
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/onboarding");
}

export async function addOnboardingPrompt(input: {
  stepId: string;
  label: string;
  body: string;
}) {
  const label = input.label.trim();
  const body = input.body;
  if (!label || !body.trim()) throw new Error("Label and body are required");
  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_prompts")
    .insert({ step_id: input.stepId, label, body });
  if (error) throw error;
  revalidatePath("/onboarding");
}

export async function deleteOnboardingPrompt(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_prompts")
    .delete()
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/onboarding");
}

export async function addOnboardingLink(input: {
  stepId: string;
  label: string;
  url: string;
}) {
  const label = input.label.trim();
  const url = input.url.trim();
  if (!label || !url) throw new Error("Label and URL are required");
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_links")
    .insert({ step_id: input.stepId, label, url: normalized });
  if (error) throw error;
  revalidatePath("/onboarding");
}

export async function deleteOnboardingLink(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_links")
    .delete()
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/onboarding");
}
