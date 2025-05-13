
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Trash2, Filter, Search, X, Archive as ArchiveIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskList } from "@/components/tasks/task-list";
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
  AlertDialogTrigger
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
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, Timestamp, orderBy } from "firebase/firestore";

export default function ArchivePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
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
      const q = query(tasksCollectionRef, where("archived", "==", true), orderBy("updatedAt", "desc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedTasks: Task[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedTasks.push({ 
            id: doc.id,
             ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
           } as Task);
        });
        setTasks(fetchedTasks);
        setIsLoadingTasks(false);
      }, (error) => {
        console.error("Error fetching archived tasks:", error);
        toast({ title: "Error", description: "Could not fetch archived tasks.", variant: "destructive" });
        setIsLoadingTasks(false);
      });

      return () => unsubscribe();
    }
  }, [user, toast]);

  const handleUpdateTask = useCallback(async (updatedTask: Task) => { // Primarily for unarchiving
    if (!user) return;
    const taskRef = doc(db, "users", user.uid, "tasks", updatedTask.id);
    try {
      await updateDoc(taskRef, { 
        archived: updatedTask.archived, 
        completed: updatedTask.completed, // if unarchiving, set completed to false
        updatedAt: Timestamp.now() 
      });
      if (!updatedTask.archived) {
        toast({title: "Task Unarchived", description: `"${updatedTask.title}" moved to active tasks.`});
      } else {
        toast({ title: "Task Updated", description: `"${updatedTask.title}" has been updated.` });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({ title: "Error", description: "Could not update task.", variant: "destructive" });
    }
  }, [user, toast]);

  const handleDeleteTask = useCallback(async (taskId: string) => { // Permanent delete
    if (!user) return;
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    try {
      await deleteDoc(taskRef);
      toast({
        title: "Task Deleted Permanently",
        description: `Archived task "${taskToDelete.title}" has been permanently deleted.`,
      });
    } catch (error) {
      console.error("Error permanently deleting task:", error);
      toast({ title: "Error", description: "Could not permanently delete task.", variant: "destructive" });
    }
  }, [user, tasks, toast]);
  
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(task => 
        priorityFilter.size === 0 || priorityFilter.has(task.priority)
      );
  }, [tasks, searchTerm, priorityFilter]);

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
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <ArchiveIcon className="mr-3 h-7 w-7 text-primary" /> Archived Tasks
        </h1>
        <Button variant="outline" asChild>
            <Link href="/dashboard">View Active Tasks</Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search archived tasks..." 
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
      </div>
      
      <TaskList
        title="" 
        tasks={filteredTasks}
        onUpdateTask={handleUpdateTask} 
        onDeleteTask={handleDeleteTask} 
        onToggleComplete={() => {}} // Not directly applicable; unarchive sets completed to false
        isArchiveView={true}
        isLoading={isLoadingTasks && tasks.length === 0} 
      />

      {!isLoadingTasks && tasks.length > 0 && filteredTasks.length === 0 && (searchTerm || priorityFilter.size > 0) && (
        <div className="text-center py-10 text-muted-foreground">
          <Search className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg">No archived tasks match your current filters.</p>
          <Button variant="link" onClick={() => { setSearchTerm(''); setPriorityFilter(new Set()); }}>Clear filters</Button>
        </div>
      )}
    </div>
  );
}
