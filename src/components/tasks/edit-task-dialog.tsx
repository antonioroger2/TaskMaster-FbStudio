"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Task } from "@/lib/types";
import { AddTaskForm } from "./add-task-form"; 

interface EditTaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTaskData: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>) => void;
}

export function EditTaskDialog({ task, isOpen, onClose, onUpdateTask }: EditTaskDialogProps) {
  if (!isOpen) return null;

  const handleFormSubmit = (
    data: Omit<Task, "id" | "createdAt" | "updatedAt" | "archived" | "completed"> & { subtasks?: Task['subtasks'] }
  ) => {
    onUpdateTask(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl"> {/* Use default padding and scrolling */}
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Modify the details of your task. Click 'Save Changes' when you are done.
          </DialogDescription>
        </DialogHeader>
        <AddTaskForm 
            onAddTask={handleFormSubmit as any} 
            onClose={onClose}
            initialData={task}
            hideHeader={true} // Instruct AddTaskForm to not render its own CardHeader
        />
      </DialogContent>
    </Dialog>
  );
}
