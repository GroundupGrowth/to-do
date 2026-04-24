"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TodoStatus } from "@/lib/types";

export async function toggleTodo(id: string, done: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .update({ done, completed_at: done ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
}

export async function createTodo(input: { title: string; clientId: string }) {
  const title = input.title.trim();
  if (!title) throw new Error("Title is required");
  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .insert({ title, client_id: input.clientId, status: "todo" });
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${input.clientId}`);
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

export async function deleteTodo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
}

export async function createClientRecord(input: {
  name: string;
  description?: string;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Name is required");
  const description = input.description?.trim() || null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ name, description })
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
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
