"use client";

import type { Task, TaskPriority } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Archive, Edit3, Star, Trash2, ChevronDown, ChevronUp, CalendarDays, Tag, ListChecks } from "lucide-react"; // Removed GripVertical, MessageSquare, Clock, CheckCircle
import { Badge } from "@/components/ui/badge";
import { EditTaskDialog } from "./edit-task-dialog";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parseISO, differenceInDays, formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onArchiveTask?: (taskId: string) => void;
  onSelectTask?: (taskId: string, selected: boolean) => void;
  isSelected?: boolean;
  isArchiveView?: boolean;
}

const priorityStyles: Record<TaskPriority, string> = {
  High: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
  Medium: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500",
  Low: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-500",
};

const priorityDotStyles: Record<TaskPriority, string> = {
  High: "bg-red-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
}

export function TaskCard({
  task,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onArchiveTask,
  onSelectTask,
  isSelected = false,
  isArchiveView = false,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const handleToggleNotes = () => setShowNotes(!showNotes);

  const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
  let dueDateText = "";
  let dueDateClassName = "text-muted-foreground";

  if (dueDate) {
    const today = new Date();
    today.setHours(0,0,0,0); 
    
    const daysDiff = differenceInDays(dueDate, today);

    if (daysDiff < 0) {
      dueDateText = `Overdue by ${formatDistanceToNowStrict(dueDate, { addSuffix: false })}`;
      dueDateClassName = "text-red-600 dark:text-red-500 font-medium";
    } else if (daysDiff === 0) {
      dueDateText = "Due today";
      dueDateClassName = "text-yellow-600 dark:text-yellow-500 font-medium";
    } else if (daysDiff === 1) {
      dueDateText = "Due tomorrow";
      dueDateClassName = "text-blue-600 dark:text-blue-500 font-medium";
    } else {
      dueDateText = `Due ${format(dueDate, "MMM d")}`;
    }
  }
  
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;

  return (
    <>
      <Card className={cn(
        "shadow-sm hover:shadow-md transition-shadow duration-200 border relative",
        task.completed && !isArchiveView ? "bg-muted/50 opacity-70" : "bg-card",
        isSelected && "border-primary ring-2 ring-primary shadow-lg",
        priorityStyles[task.priority]
      )}>
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 rounded-l-md", priorityDotStyles[task.priority])}></div>

        <CardHeader className="pb-3 pl-4 pr-2 pt-3">
          <div className="flex items-start space-x-3">
            {onSelectTask && !isArchiveView && (
              <Checkbox
                id={`select-${task.id}`}
                checked={isSelected}
                onCheckedChange={(checked) => onSelectTask(task.id, !!checked)}
                className="mt-1 border-muted-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[state=checked]:border-accent"
                aria-label={`Select task ${task.title}`}
              />
            )}
            
            {isArchiveView ? (
                <Archive className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
             ) : (
               <Checkbox
                id={`complete-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => onToggleComplete(task.id)}
                className="mt-1 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary"
                aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
              />
             )}

            <div className="flex-grow">
              <CardTitle className={cn("text-lg font-semibold leading-tight", task.completed && !isArchiveView && "line-through text-muted-foreground")}>
                {task.title}
              </CardTitle>
              {task.subtasks?.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <ListChecks className="h-3 w-3 mr-1" /> {completedSubtasks}/{task.subtasks.length} subtasks
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1 shrink-0">
               {task.pinnedNote && <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4" />
                <span className="sr-only">Edit Task</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-2 pl-4 pr-2 text-sm">
          {(task.notes || dueDate || task.tags?.length > 0 || task.categories?.length > 0) && (
             <div className="space-y-2 ml-8"> 
              {task.notes && (
                <div>
                  <Button variant="link" size="sm" onClick={handleToggleNotes} className="px-0 py-0 h-auto text-xs text-muted-foreground hover:text-primary">
                    {showNotes ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                    Notes
                  </Button>
                  {showNotes && (
                    <CardDescription className="mt-1 prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap break-words p-2 bg-muted/30 rounded-md">
                      {task.notes}
                    </CardDescription>
                  )}
                </div>
              )}

              {dueDateText && (
                <div className={cn("flex items-center text-xs", dueDateClassName)}>
                  <CalendarDays className="h-3.5 w-3.5 mr-1.5" /> {dueDateText}
                </div>
              )}
              
              {task.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                   <ListChecks className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  {task.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs font-normal bg-primary/10 text-primary hover:bg-primary/20">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}

              {task.tags?.length > 0 && (
                 <div className="flex flex-wrap gap-1 items-center">
                   <Tag className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal border-foreground/30 text-foreground/70">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
             </div>
          )}
        </CardContent>
        
        {!isArchiveView && (
          <CardFooter className="flex justify-end space-x-2 py-2 pr-2 pl-4">
            {!task.completed && onArchiveTask && (
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent-foreground" onClick={() => onArchiveTask(task.id)}>
                <Archive className="mr-1.5 h-4 w-4" /> Archive
              </Button>
            )}
             {(task.completed && onArchiveTask) && ( // Show Archive button for completed tasks too
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent-foreground" onClick={() => onArchiveTask(task.id)}>
                <Archive className="mr-1.5 h-4 w-4" /> Archive
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the task "{task.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteTask(task.id)} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
         {isArchiveView && (
          <CardFooter className="flex justify-end space-x-2 py-2 pr-2 pl-4">
            <Button variant="outline" size="sm" onClick={() => onUpdateTask({...task, archived: false, completed: false })}>
              Unarchive
            </Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete Permanently
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This task "{task.title}" will be permanently deleted from the archive. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteTask(task.id)} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>

      {isEditing && (
        <EditTaskDialog
          task={task}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onUpdateTask={(updatedTaskData) => {
            onUpdateTask({ ...task, ...updatedTaskData }); // Spread existing task and updated fields
            setIsEditing(false);
          }}
        />
      )}
    </>
  );
}
