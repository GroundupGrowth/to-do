export type Client = {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
  created_at: string;
};

export const TODO_STAGES = ["todo", "in_progress", "questions", "postpone"] as const;
export type TodoStatus = (typeof TODO_STAGES)[number];

export const ASSIGNEES = ["dylan", "xander", "emson", "team"] as const;
export type Assignee = (typeof ASSIGNEES)[number];

export const ASSIGNEE_META: Record<
  Assignee,
  { label: string; bg: string; fg: string }
> = {
  dylan:  { label: "Dylan",  bg: "#E7E2EF", fg: "#4B3F6E" },
  xander: { label: "Xander", bg: "#E3ECE4", fg: "#3F6248" },
  emson:  { label: "Emson",  bg: "#F7E6DF", fg: "#8A4A3A" },
  team:   { label: "Team",   bg: "#EEE6D9", fg: "#6E5A36" },
};

export type Todo = {
  id: string;
  client_id: string;
  title: string;
  done: boolean;
  status: TodoStatus;
  assignee: Assignee | null;
  completed_at: string | null;
  triaged_at: string | null;
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

export type TodoNote = {
  id: string;
  todo_id: string;
  author: Assignee | null;
  body: string;
  created_at: string;
};

export type TodoWithNotes = Todo & {
  notes_count: number;
};

export type TodoWithClient = TodoWithNotes & {
  client: Pick<Client, "id" | "name">;
};

export type OnboardingStep = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
};

export type OnboardingPrompt = {
  id: string;
  step_id: string;
  label: string;
  body: string;
  created_at: string;
};

export type OnboardingLink = {
  id: string;
  step_id: string;
  label: string;
  url: string;
  created_at: string;
};

export type OnboardingStepWithChildren = OnboardingStep & {
  prompts: OnboardingPrompt[];
  links: OnboardingLink[];
};
