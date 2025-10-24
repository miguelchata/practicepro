'use client';

import { useState } from 'react';
import type { Task, UserStory } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MoreVertical,
  Trash2,
  Edit,
  ListPlus,
  List,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AddTaskForm } from './add-task-form';
import { useAddTask, useAddTasks, useDeleteTask, useUpdateUserStory, useDeleteUserStory } from '@/firebase/firestore/use-update-user-story';
import { useTasks } from '@/firebase/firestore/use-collection';
import { EditUserStoryForm } from './edit-user-story-form';
import { Skeleton } from '../ui/skeleton';

type UserStoryCardProps = {
  story: UserStory;
  projectId: string;
};

export function UserStoryCard({ story, projectId }: UserStoryCardProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditStoryDialogOpen, setIsEditStoryDialogOpen] = useState(false);
    const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

    const updateUserStory = useUpdateUserStory();
    const deleteUserStory = useDeleteUserStory();
    const addTask = useAddTask();
    const addTasks = useAddTasks();

    const handleEditClick = () => {
        setIsEditStoryDialogOpen(true);
    };

    const handleUserStoryUpdated = async (storyId: string, updatedData: Partial<UserStory>) => {
        await updateUserStory(projectId, storyId, updatedData);
        setIsEditStoryDialogOpen(false);
    };

    const handleDeleteStory = (storyId: string) => {
        deleteUserStory(projectId, storyId);
    };
    
    const handleAddTaskClick = () => {
        setIsAddTaskDialogOpen(true);
    };

    const handleTaskAdded = async (newTask: Omit<Task, 'id' | 'status'>) => {
        await addTask(projectId, story.id, newTask);
        setIsAddTaskDialogOpen(false);
    };
    
    const handleTasksAdded = async (newTasks: Omit<Task, 'id' | 'status'>[]) => {
        await addTasks(projectId, story.id, newTasks);
        setIsAddTaskDialogOpen(false);
    };
    
  return (
    <>
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        window.localStorage.setItem('draggingStory', JSON.stringify(story));
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      <CardHeader className="p-4 flex-row items-start justify-between">
        <div onClick={() => setIsDetailsOpen(true)} className="cursor-pointer space-y-1">
            <p className="font-medium flex items-center gap-2">{story.title}</p>
            <Badge variant="secondary">{story.ticketId}</Badge>
        </div>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsDetailsOpen(true)}>
                <Ticket className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Story</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleAddTaskClick}>
                <ListPlus className="mr-2 h-4 w-4" />
                <span>Add Task</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Story</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user story <strong>&quot;{story.title}&quot;</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteStory(story.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="p-4 pt-0" onClick={() => setIsDetailsOpen(true)}>
        <p className="text-xs text-muted-foreground">{story.features.length} feature{story.features.length !== 1 && 's'}</p>
      </CardContent>
    </Card>

    {/* Story Details Dialog */}
    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Badge variant="outline">{story.ticketId}</Badge> 
                <span>{story.title}</span>
            </DialogTitle>
            <DialogDescription>
                <Badge>{story.status}</Badge>
            </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-6">
                <div>
                    <h5 className="font-semibold text-foreground">Features</h5>
                    <ul className="list-disc list-inside space-y-1 mt-1 text-muted-foreground">
                        {story.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                        ))}
                    </ul>
                </div>
                <TasksList projectId={projectId} storyId={story.id} />
            </div>
        </DialogContent>
    </Dialog>
    
    {/* Edit Story Dialog */}
    <Dialog open={isEditStoryDialogOpen} onOpenChange={setIsEditStoryDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
            <DialogTitle>Edit User Story</DialogTitle>
            <DialogDescription>
                Update the details for your user story.
            </DialogDescription>
            </DialogHeader>
            <EditUserStoryForm
            story={story}
            onUserStoryUpdated={handleUserStoryUpdated}
            />
        </DialogContent>
    </Dialog>

    {/* Add Task Dialog */}
    <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Add a task for user story: <strong>{story.ticketId}</strong>
            </DialogDescription>
          </DialogHeader>
          <AddTaskForm
            onTaskAdded={handleTaskAdded}
            onTasksAdded={handleTasksAdded}
            userStoryTicketId={story.ticketId}
            existingTasksCount={story.tasks?.length || 0}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function TasksList({ projectId, storyId }: { projectId: string; storyId: string }) {
    const { data: tasks, loading, error } = useTasks(projectId, storyId);
    const deleteTask = useDeleteTask();
  
    const handleDeleteTask = (taskId: string) => {
      deleteTask(projectId, storyId, taskId);
    };
  
    if (loading) {
      return <Skeleton className="h-16 w-full" />;
    }
  
    if (error) {
      return <p className="text-destructive">Error loading tasks.</p>;
    }
  
    return (
      <div>
        <h5 className="font-semibold text-foreground mt-4">Tasks</h5>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-1">No tasks for this story yet.</p>
        ) : (
          <ul className="space-y-2 mt-1">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border">
                <List className="h-4 w-4" />
                <span className="font-mono text-xs">{task.taskId}</span>
                <Badge variant="secondary">{task.type}</Badge>
                <span className="flex-1 text-sm">{task.task}</span>
                <Badge variant={task.status === 'Done' ? 'default' : 'outline'}>{task.status}</Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the task <strong>&quot;{task.task}&quot;</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  
