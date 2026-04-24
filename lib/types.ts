export type Client = {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
  created_at: string;
};

export const TODO_STAGES = ["todo", "in_progress", "questions", "postpone"] as const;
export type TodoStatus = (typeof TODO_STAGES)[number];

export type Todo = {
  id: string;
  client_id: string;
  title: string;
  done: boolean;
  status: TodoStatus;
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
