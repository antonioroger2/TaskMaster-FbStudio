"use client";

import type { Task } from "@/lib/types";
import { TaskCard } from "./task-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Archive, Inbox } from "lucide-react";

interface TaskListProps {
  title: string;
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onArchiveTask?: (taskId: string) => void; // Optional for completed list
  onSelectTask?: (taskId: string, selected: boolean) => void;
  selectedTasks?: Set<string>;
  isLoading?: boolean;
  defaultCollapsed?: boolean;
  isArchiveView?: boolean;
}

export function TaskList({
  title,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onArchiveTask,
  onSelectTask,
  selectedTasks,
  isLoading = false,
  defaultCollapsed = false,
  isArchiveView = false,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-3 text-foreground/80">{title}</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-card rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-sm" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (tasks.length === 0 && !isArchiveView && title !== "Archived Tasks") { // Don't show "No tasks in this section" for archive view on main page if it's empty
     if (title === "Active Tasks" || title === "Completed Tasks") { // Only for specific sections if they are empty.
        return (
          <div className="py-6">
            <h2 className="text-xl font-semibold mb-3 text-foreground/80">{title}</h2>
            <p className="text-muted-foreground text-sm">No tasks in this section.</p>
          </div>
        );
     }
     return null;
  }
  
  const content = (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onToggleComplete={onToggleComplete}
          onArchiveTask={onArchiveTask}
          onSelectTask={onSelectTask}
          isSelected={selectedTasks?.has(task.id)}
          isArchiveView={isArchiveView}
        />
      ))}
    </div>
  );

  if (defaultCollapsed) {
    return (
      <Accordion type="single" collapsible defaultValue={!defaultCollapsed ? "item-1" : undefined}>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-xl font-semibold text-foreground/80 hover:no-underline data-[state=open]:pb-3">
            {title} ({tasks.length})
          </AccordionTrigger>
          <AccordionContent>
            {content}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
  
  if (isArchiveView && tasks.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Archive className="mx-auto h-12 w-12 mb-4" />
        <p className="text-lg">Your archive is empty.</p>
        <p className="text-sm">Completed and archived tasks will appear here.</p>
      </div>
    );
  }


  return (
    <div>
      <h2 className="text-xl font-semibold mb-3 text-foreground/80">{title} ({tasks.length})</h2>
      {content}
    </div>
  );
}
