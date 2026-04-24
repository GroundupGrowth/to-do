import { createClient } from "@/lib/supabase/server";
import type {
  Client,
  ClientSummary,
  Link,
  Todo,
  TodoWithClient,
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

export async function getOpenTodosWithClients(): Promise<TodoWithClient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*, client:clients(id,name)")
    .eq("done", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as TodoWithClient[];
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

export async function getTodosForClient(clientId: string): Promise<Todo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
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
