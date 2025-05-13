
export type TaskPriority = "High" | "Medium" | "Low";

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: TaskPriority;
  dueDate?: string; // ISO string for date
  subtasks: Subtask[];
  tags: string[];
  categories: string[];
  completed: boolean;
  archived: boolean;
  pinnedNote?: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  userId: string; // To associate task with a user
}
