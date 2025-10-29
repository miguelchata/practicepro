'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useProject } from '@/firebase/firestore/use-doc';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PlusCircle,
  CheckCircle,
  ListTodo,
  Loader,
} from 'lucide-react';
import type { ProjectStatus, Task, TaskPriority, TaskStatus } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddTaskForm } from '@/components/projects/add-task-form';
import { useTasks } from '@/firebase/firestore/use-collection';
import { useUpdateTask } from '@/firebase/firestore/use-update-task';
import { TaskCard } from '@/components/projects/task-card';
import { useAddTasks } from '@/firebase/firestore/use-add-tasks';
import { TaskDetailView } from '@/components/projects/task-detail-view';

const KANBAN_COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

const KANBAN_COLUMN_ICONS: Record<TaskStatus, React.ElementType> = {
    'To Do': ListTodo,
    'In Progress': Loader,
    'Done': CheckCircle
};

const priorityOrder: Record<TaskPriority, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project, loading } = useProject(projectId);
  const { data: tasks, loading: tasksLoading } = useTasks(projectId);
  const addTasks = useAddTasks();
  const updateTask = useUpdateTask();

  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      'To Do': [],
      'In Progress': [],
      'Done': [],
    };
    tasks.forEach((task) => {
      if (task.status && grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        grouped['To Do'].push(task); // Default to To Do
      }
    });

    // Sort the To Do column by priority
    grouped['To Do'].sort(
      (a, b) =>
        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    );

    return grouped;
  }, [tasks]);

  const handleTaskAdded = async (
    newTasks: Omit<Task, 'id'> | Omit<Task, 'id'>[]
  ) => {
    await addTasks(projectId, newTasks);
    setIsAddTaskDialogOpen(false);
  };

  const handleDragEnd = (task: Task, newStatus: TaskStatus) => {
    if (task.status !== newStatus) {
      updateTask(projectId, task.id, { status: newStatus });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Loading Project..." backButtonHref="/projects"/>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Project Not Found" backButtonHref="/projects" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
          <p>The project you are looking for does not exist.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={project.title} backButtonHref="/projects" />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        {selectedTaskId ? (
            <TaskDetailView taskId={selectedTaskId} projectId={projectId} onClose={() => setSelectedTaskId(null)} />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">
                  Task Board
                </h2>
                <p className="text-muted-foreground">
                  Drag and drop tasks to manage your project's workflow.
                </p>
              </div>
              <Dialog
                open={isAddTaskDialogOpen}
                onOpenChange={setIsAddTaskDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>New Task</DialogTitle>
                    <DialogDescription>
                      Add a new task to the project via the form or by using JSON.
                    </DialogDescription>
                  </DialogHeader>
                  <AddTaskForm
                    onTaskAdded={handleTaskAdded}
                    existingTasksCount={tasks.length}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {tasksLoading ? (
                  KANBAN_COLUMNS.map((col) => (
                    <div key={col} className="p-2 bg-muted rounded-lg">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ))
                ) : (
                  KANBAN_COLUMNS.map((status) => {
                    const Icon = KANBAN_COLUMN_ICONS[status];
                    return (
                        <div
                        key={status}
                        className="rounded-lg bg-muted/50 p-3"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                            const taskData = window.localStorage.getItem('draggingTask');
                            if (taskData) {
                            const task: Task = JSON.parse(taskData);
                            handleDragEnd(task, status);
                            window.localStorage.removeItem('draggingTask');
                            }
                        }}
                        >
                        <h3 className="font-semibold font-headline mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Icon className="h-5 w-5" />
                                {status}
                            </span>
                            <span className="text-sm text-muted-foreground bg-background rounded-full px-2 py-0.5">
                            {tasksByStatus[status].length}
                            </span>
                        </h3>
                        <div className="space-y-3">
                            {tasksByStatus[status].map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                projectId={projectId}
                                onTaskSelected={setSelectedTaskId}
                            />
                            ))}
                            {tasksByStatus[status].length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                                Drop tasks here
                            </div>
                            )}
                        </div>
                        </div>
                    )
                  })
                )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
