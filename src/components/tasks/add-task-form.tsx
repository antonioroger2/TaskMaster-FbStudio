"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Task, TaskPriority } from "@/lib/types";
import { PRIORITIES } from "@/lib/constants";
import { CalendarIcon, Tag, X, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";


const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  notes: z.string().max(1000, "Notes too long").optional(),
  priority: z.enum(PRIORITIES as [TaskPriority, ...TaskPriority[]], {
    required_error: "Priority is required",
  }),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  pinnedNote: z.boolean().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface AddTaskFormProps {
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "archived" | "completed" | "subtasks" | "userId"> & { subtasks?: Task['subtasks'] }) => void;
  onClose: () => void;
  initialData?: Partial<Task>; 
  hideHeader?: boolean;
}

export function AddTaskForm({ onAddTask, onClose, initialData, hideHeader = false }: AddTaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      notes: initialData?.notes || "",
      priority: initialData?.priority || "Medium",
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
      tags: initialData?.tags || [],
      categories: initialData?.categories || [],
      pinnedNote: initialData?.pinnedNote || false,
    },
  });

  const [currentTag, setCurrentTag] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");

  const addTag = () => {
    if (currentTag.trim() && !form.getValues("tags")?.includes(currentTag.trim())) {
      form.setValue("tags", [...(form.getValues("tags") || []), currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue("tags", form.getValues("tags")?.filter(tag => tag !== tagToRemove));
  };
  
  const addCategory = () => {
    const catToAdd = currentCategory.trim();
    if (catToAdd && !form.getValues("categories")?.includes(catToAdd)) {
      form.setValue("categories", [...(form.getValues("categories") || []), catToAdd]);
      setCurrentCategory("");
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    form.setValue("categories", form.getValues("categories")?.filter(cat => cat !== categoryToRemove));
  };

  function onSubmit(data: TaskFormValues) {
    onAddTask({
      ...data,
      dueDate: data.dueDate?.toISOString().split('T')[0], 
      tags: data.tags || [],
      categories: data.categories || [],
      subtasks: initialData?.subtasks || [], 
      pinnedNote: data.pinnedNote || false,
    });
    form.reset();
    onClose();
  }

  return (
    <Card className={cn(
      "w-full",
      hideHeader 
        ? "shadow-none border-none my-0" 
        : "max-w-lg mx-auto my-8 shadow-xl border-primary/20"
    )}>
      {!hideHeader && (
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center">
            <PlusCircle className="mr-3 h-7 w-7" />
            {initialData ? "Edit Task" : "Add New Task"}
          </CardTitle>
        </CardHeader>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className={cn(
            "space-y-6 pb-6",
            hideHeader ? "pt-6" : "pt-2" // More top padding if header is hidden
          )}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Buy groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any details..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="pinnedNote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel>Pin Note</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Categories Field */}
            <FormItem>
              <FormLabel>Categories (Optional)</FormLabel>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Add a category" 
                  value={currentCategory}
                  onChange={(e) => setCurrentCategory(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory();}}}
                />
                <Button type="button" variant="outline" size="icon" onClick={addCategory} className="shrink-0">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.watch("categories")?.map((category) => (
                  <Badge key={category} variant="secondary" className="text-sm py-1 px-2.5 bg-primary/10 text-primary hover:bg-primary/20">
                    {category}
                    <button type="button" onClick={() => removeCategory(category)} className="ml-1.5 appearance-none outline-none focus:ring-1 focus:ring-primary rounded-full">
                      <X className="h-3.5 w-3.5 text-primary/70 hover:text-primary" />
                    </button>
                  </Badge>
                ))}
              </div>
            </FormItem>

            {/* Tags Field */}
             <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Add a tag" 
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag();}}}
                />
                 <Button type="button" variant="outline" size="icon" onClick={addTag} className="shrink-0">
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.watch("tags")?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm py-1 px-2.5 border-foreground/30 text-foreground/70">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 appearance-none outline-none focus:ring-1 focus:ring-foreground/50 rounded-full">
                      <X className="h-3.5 w-3.5 text-foreground/50 hover:text-foreground" />
                    </button>
                  </Badge>
                ))}
              </div>
            </FormItem>

          </CardContent>
          <CardFooter className={cn(
            "flex justify-end space-x-3 pt-6",
            !hideHeader && "border-t" // No top border if header is hidden
          )}>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="shadow-sm" disabled={form.formState.isSubmitting}>
              {initialData ? "Save Changes" : "Add Task"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
