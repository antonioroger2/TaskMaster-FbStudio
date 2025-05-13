
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PlusCircle, Archive, Trash2, CheckCircle, Undo, Filter, Search, X, ListTodo as ListTodoIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskList } from "@/components/tasks/task-list";
import { AddTaskForm } from "@/components/tasks/add-task-form";
import type { Task, TaskPriority } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { PRIORITIES } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch, Timestamp, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Set<TaskPriority>>(new Set());
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setIsLoadingTasks(true);
      const tasksCollectionRef = collection(db, "users", user.uid, "tasks");
      const q = query(tasksCollectionRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedTasks: Task[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedTasks.push({ 
            id: doc.id,
            ...data,
            // Ensure dates are strings if stored as Timestamps
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          } as Task);
        });
        setTasks(fetchedTasks);
        setIsLoadingTasks(false);
      }, (error) => {
        console.error("Error fetching tasks:", error);
        toast({ title: "Error", description: "Could not fetch tasks.", variant: "destructive" });
        setIsLoadingTasks(false);
      });

      return () => unsubscribe();
    }
  }, [user, toast]);

  const handleAddTask = useCallback(async (newTaskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "archived" | "completed" | "userId">) => {
    if (!user) return;
    
    const taskWithMetadata: Omit<Task, "id"> = {
      ...newTaskData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
      completed: false,
      subtasks: newTaskData.subtasks || [],
    };

    try {
      const tasksCollectionRef = collection(db, "users", user.uid, "tasks");
      const docRef = await addDoc(tasksCollectionRef, {
        ...taskWithMetadata,
        createdAt: Timestamp.fromDate(new Date(taskWithMetadata.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(taskWithMetadata.updatedAt)),
      });
      // setTasks(prev => [{...taskWithMetadata, id: docRef.id}, ...prev]); // Handled by onSnapshot
      setShowAddTaskForm(false);
      toast({ title: "Task Added", description: `"${taskWithMetadata.title}" has been added.` });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({ title: "Error", description: "Could not add task.", variant: "destructive" });
    }
  }, [user, toast]);

  const handleUpdateTask = useCallback(async (updatedTask: Task) => {
    if (!user) return;
    const taskRef = doc(db, "users", user.uid, "tasks", updatedTask.id);
    const updateData = { 
        ...updatedTask, 
        updatedAt: Timestamp.now(),
        // Ensure dates are Timestamps if they were converted to string for form
        createdAt: Timestamp.fromDate(new Date(updatedTask.createdAt)), 
        dueDate: updatedTask.dueDate ? updatedTask.dueDate : null, // Keep as string or convert if needed
    };
    delete (updateData as any).id; // Do not store id field within the document

    try {
      await updateDoc(taskRef, updateData);
      toast({ title: "Task Updated", description: `"${updatedTask.title}" has been updated.` });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({ title: "Error", description: "Could not update task.", variant: "destructive" });
    }
  }, [user, toast]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!user) return;
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    try {
      await deleteDoc(taskRef);
      // No need for setLastDeletedTask or undo with Firestore real-time updates
      toast({ title: "Task Deleted", description: `"${taskToDelete.title}" has been deleted.` });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({ title: "Error", description: "Could not delete task.", variant: "destructive" });
    }
  }, [user, tasks, toast]);
  
  const handleToggleComplete = useCallback(async (taskId: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    try {
      await updateDoc(taskRef, { 
        completed: !task.completed, 
        updatedAt: Timestamp.now() 
      });
      // Toast handled by optimistic update or onSnapshot
    } catch (error) {
      console.error("Error toggling task complete:", error);
      toast({ title: "Error", description: "Could not update task status.", variant: "destructive" });
    }
  }, [user, tasks, toast]);

  const handleArchiveTask = useCallback(async (taskId: string) => {
    if (!user) return;
    const taskToArchive = tasks.find(t => t.id === taskId);
    if (!taskToArchive) return;
    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    try {
      await updateDoc(taskRef, { 
        archived: true, 
        completed: true, // Usually archived tasks are also considered complete
        updatedAt: Timestamp.now() 
      });
      toast({title: "Task Archived", description: `"${taskToArchive.title}" moved to archive.`});
    } catch (error) {
      console.error("Error archiving task:", error);
      toast({ title: "Error", description: "Could not archive task.", variant: "destructive" });
    }
  }, [user, tasks, toast]);

  const handleSelectTask = (taskId: string, isSelected: boolean) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (isSelected) newSet.add(taskId);
      else newSet.delete(taskId);
      return newSet;
    });
  };

  const handleBulkOperation = async (operation: "complete" | "archive" | "delete") => {
    if (!user || selectedTasks.size === 0) return;
    
    const batch = writeBatch(db);
    selectedTasks.forEach(taskId => {
      const taskRef = doc(db, "users", user.uid, "tasks", taskId);
      if (operation === "complete") {
        batch.update(taskRef, { completed: true, updatedAt: Timestamp.now() });
      } else if (operation === "archive") {
        batch.update(taskRef, { archived: true, completed: true, updatedAt: Timestamp.now() });
      } else if (operation === "delete") {
        batch.delete(taskRef);
      }
    });

    try {
      await batch.commit();
      toast({title: "Bulk Action Successful", description: `${selectedTasks.size} tasks ${operation === "delete" ? "deleted" : operation + "d"}.`});
      setSelectedTasks(new Set());
    } catch (error) {
      console.error(`Error bulk ${operation}:`, error);
      toast({ title: "Bulk Action Failed", description: `Could not ${operation} tasks.`, variant: "destructive"});
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => !task.archived) // Only non-archived for main dashboard
      .filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(task => 
        priorityFilter.size === 0 || priorityFilter.has(task.priority)
      );
  }, [tasks, searchTerm, priorityFilter]);

  const activeTasks = useMemo(() => filteredTasks.filter(task => !task.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(task => task.completed), [filteredTasks]);
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null; // Redirect handled by useEffect

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Tasks</h1>
        <Button onClick={() => setShowAddTaskForm(true)} className="shadow-sm">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Task
        </Button>
      </div>

      {showAddTaskForm && (
        <AddTaskForm
          onAddTask={handleAddTask}
          onClose={() => setShowAddTaskForm(false)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-10 pr-10 h-10 w-full sm:w-64" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setSearchTerm('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Priority {priorityFilter.size > 0 ? `(${priorityFilter.size})` : ''}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRIORITIES.map(p => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={priorityFilter.has(p)}
                  onCheckedChange={(checked) => {
                    setPriorityFilter(prev => {
                      const next = new Set(prev);
                      if(checked) next.add(p); else next.delete(p);
                      return next;
                    })
                  }}
                >
                  {p}
                </DropdownMenuCheckboxItem>
              ))}
               {priorityFilter.size > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setPriorityFilter(new Set())} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    Clear Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {selectedTasks.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedTasks.size} selected</span>
            <Button variant="outline" size="sm" onClick={() => handleBulkOperation("complete")}>
              <CheckCircle className="mr-2 h-4 w-4" /> Complete
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkOperation("archive")}>
              <Archive className="mr-2 h-4 w-4" /> Archive
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete {selectedTasks.size} selected tasks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBulkOperation("delete")} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      
      <TaskList
        title="Active Tasks"
        tasks={activeTasks}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
        onArchiveTask={handleArchiveTask}
        onSelectTask={handleSelectTask}
        selectedTasks={selectedTasks}
        isLoading={isLoadingTasks && tasks.length === 0}
      />

      {completedTasks.length > 0 && (
        <TaskList
          title="Completed Tasks"
          tasks={completedTasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          onArchiveTask={handleArchiveTask}
          onSelectTask={handleSelectTask}
          selectedTasks={selectedTasks}
          defaultCollapsed={true}
        />
      )}

      {!isLoadingTasks && tasks.filter(t => !t.archived).length === 0 && !showAddTaskForm && !searchTerm && priorityFilter.size === 0 && (
         <div className="text-center py-20 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <ListTodoIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-6" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No Tasks Yet!</h2>
          <p className="text-muted-foreground mb-6">Get started by adding your first task.</p>
          <Button onClick={() => setShowAddTaskForm(true)} size="lg" className="shadow-sm">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Task
          </Button>
        </div>
      )}
      
      {!isLoadingTasks && tasks.filter(t => !t.archived).length > 0 && activeTasks.length === 0 && completedTasks.length === 0 && (searchTerm || priorityFilter.size > 0) && (
        <div className="text-center py-10 text-muted-foreground">
          <Search className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg">No tasks match your current filters.</p>
          <Button variant="link" onClick={() => { setSearchTerm(''); setPriorityFilter(new Set()); }}>Clear filters</Button>
        </div>
      )}
    </div>
  );
}
