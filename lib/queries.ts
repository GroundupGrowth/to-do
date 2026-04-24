import { createClient } from "@/lib/supabase/server";
import type {
  Client,
  ClientSummary,
  Link,
  OnboardingStepWithChildren,
  TodoNote,
  TodoWithClient,
  TodoWithNotes,
} from "@/lib/types";

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getClientSummaries(): Promise<ClientSummary[]> {
  const supabase = await createClient();
  const [clientsRes, todosRes, linksRes] = await Promise.all([
    supabase.from("clients").select("*").order("name", { ascending: true }),
    supabase.from("todos").select("id,client_id,done"),
    supabase.from("links").select("id,client_id"),
  ]);

  if (clientsRes.error) throw clientsRes.error;
  if (todosRes.error) throw todosRes.error;
  if (linksRes.error) throw linksRes.error;

  const clients = clientsRes.data ?? [];
  const todos = todosRes.data ?? [];
  const links = linksRes.data ?? [];

  return clients.map((c) => {
    const clientTodos = todos.filter((t) => t.client_id === c.id);
    const total = clientTodos.length;
    const done = clientTodos.filter((t) => t.done).length;
    const open = total - done;
    const linksCount = links.filter((l) => l.client_id === c.id).length;
    const notesCount = (c.notes ?? "").trim().length > 0 ? 1 : 0;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    return {
      ...c,
      openTodos: open,
      totalTodos: total,
      doneTodos: done,
      linksCount,
      notesCount,
      progress,
    };
  });
}

async function attachNoteCounts<T extends { id: string }>(
  todos: T[],
): Promise<(T & { notes_count: number })[]> {
  if (todos.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todo_notes")
    .select("todo_id")
    .in(
      "todo_id",
      todos.map((t) => t.id),
    );
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.todo_id, (counts.get(row.todo_id) ?? 0) + 1);
  }
  return todos.map((t) => ({ ...t, notes_count: counts.get(t.id) ?? 0 }));
}

export async function getOpenTodosWithClients(): Promise<TodoWithClient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*, client:clients(id,name)")
    .eq("done", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as unknown as TodoWithClient[];
  return attachNoteCounts(rows);
}

export async function getInboxTodos(): Promise<{
  clientId: string | null;
  todos: TodoWithClient[];
}> {
  const supabase = await createClient();
  const { data: inbox } = await supabase
    .from("clients")
    .select("id")
    .eq("name", "Inbox")
    .maybeSingle();

  if (!inbox?.id) return { clientId: null, todos: [] };

  const { data, error } = await supabase
    .from("todos")
    .select("*, client:clients(id,name)")
    .eq("done", false)
    .eq("client_id", inbox.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as unknown as TodoWithClient[];
  const withNotes = await attachNoteCounts(rows);
  return { clientId: inbox.id, todos: withNotes };
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function getTodosForClient(
  clientId: string,
): Promise<TodoWithNotes[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return attachNoteCounts(data ?? []);
}

export async function getLinksForClient(clientId: string): Promise<Link[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getOnboardingFlow(): Promise<OnboardingStepWithChildren[]> {
  const supabase = await createClient();
  const [stepsRes, promptsRes, linksRes] = await Promise.all([
    supabase
      .from("onboarding_steps")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("onboarding_prompts")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("onboarding_links")
      .select("*")
      .order("created_at", { ascending: true }),
  ]);
  if (stepsRes.error) throw stepsRes.error;
  if (promptsRes.error) throw promptsRes.error;
  if (linksRes.error) throw linksRes.error;

  const prompts = promptsRes.data ?? [];
  const links = linksRes.data ?? [];

  return (stepsRes.data ?? []).map((s) => ({
    ...s,
    prompts: prompts.filter((p) => p.step_id === s.id),
    links: links.filter((l) => l.step_id === s.id),
  }));
}

export async function getNotesForTodo(todoId: string): Promise<TodoNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todo_notes")
    .select("*")
    .eq("todo_id", todoId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TodoNote[];
}
