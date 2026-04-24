export type Client = {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
  created_at: string;
};

export type Todo = {
  id: string;
  client_id: string;
  title: string;
  done: boolean;
  completed_at: string | null;
  created_at: string;
};

export type Link = {
  id: string;
  client_id: string;
  label: string;
  url: string;
  created_at: string;
};

export type ClientSummary = Client & {
  openTodos: number;
  totalTodos: number;
  doneTodos: number;
  linksCount: number;
  notesCount: number;
  progress: number;
};

export type TodoWithClient = Todo & {
  client: Pick<Client, "id" | "name">;
};
