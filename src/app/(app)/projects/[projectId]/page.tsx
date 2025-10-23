'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProject } from '@/firebase/firestore/use-doc';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Edit,
  PlusCircle,
  Calendar,
  CircleDot,
  PauseCircle,
  CheckCircle,
  Circle,
  Ticket,
  MoreVertical,
  Trash2,
  ListPlus,
  List,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ProjectStatus, UserStory, Task } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddUserStoryForm } from '@/components/projects/add-user-story-form';
import { EditUserStoryForm } from '@/components/projects/edit-user-story-form';
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
import { useAddUserStory } from '@/firebase/firestore/use-add-user-story';
import { useUserStories, useTasks } from '@/firebase/firestore/use-collection';
import {
  useUpdateUserStory,
  useDeleteUserStory,
  useAddTask,
  useDeleteTask,
  useAddTasks,
} from '@/firebase/firestore/use-update-user-story';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AddTaskForm } from '@/components/projects/add-task-form';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project, loading } = useProject(projectId);
  const { data: userStories, loading: storiesLoading } = useUserStories(projectId);
  const addUserStory = useAddUserStory();
  const updateUserStory = useUpdateUserStory();
  const deleteUserStory = useDeleteUserStory();
  const addTask = useAddTask();
  const addTasks = useAddTasks();

  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);
  const [isEditStoryDialogOpen, setIsEditStoryDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);

  const handleUserStoryAdded = async (newUserStory: Omit<UserStory, 'id'>) => {
    await addUserStory(projectId, newUserStory);
    setIsAddStoryDialogOpen(false);
  };
  
  const handleEditClick = (story: UserStory) => {
    setSelectedStory(story);
    setIsEditStoryDialogOpen(true);
  };
  
  const handleUserStoryUpdated = async (storyId: string, updatedData: Partial<UserStory>) => {
    await updateUserStory(projectId, storyId, updatedData);
    setIsEditStoryDialogOpen(false);
    setSelectedStory(null);
  };

  const handleDeleteStory = (storyId: string) => {
    deleteUserStory(projectId, storyId);
  };

  const handleAddTaskClick = (story: UserStory) => {
    setSelectedStory(story);
    setIsAddTaskDialogOpen(true);
  };

  const handleTaskAdded = async (newTask: Omit<Task, 'id' | 'status'>) => {
    if (selectedStory) {
      await addTask(projectId, selectedStory.id, newTask);
    }
    setIsAddTaskDialogOpen(false);
  };

  const handleTasksAdded = async (newTasks: Omit<Task, 'id' | 'status'>[]) => {
    if (selectedStory) {
        await addTasks(projectId, selectedStory.id, newTasks);
    }
    setIsAddTaskDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Loading Project..." />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Project Not Found" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 md:gap-8 md:p-8">
          <p>The project you are looking for does not exist.</p>
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress':
        return <CircleDot className="h-4 w-4 text-blue-500" />;
      case 'On Hold':
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      case 'Not Started':
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'On Hold':
        return 'secondary';
      case 'In Progress':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={project.title} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
            {project.title}
          </h1>
          <Badge variant={getStatusVariant(project.status)} className="ml-auto">
            {project.status}
          </Badge>
          <Button asChild>
            <Link href={`/projects/${project.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              {getStatusIcon(project.status)}
              <span>
                Status: <strong>{project.status}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Start Date:{' '}
                <strong>{new Date(project.startDate).toLocaleDateString()}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Target Date:{' '}
                <strong>{new Date(project.targetDate).toLocaleDateString()}</strong>
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Stories</CardTitle>
                <CardDescription>
                  Features and requirements for this project.
                </CardDescription>
              </div>
              <Dialog open={isAddStoryDialogOpen} onOpenChange={setIsAddStoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add User Story
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>New User Story</DialogTitle>
                    <DialogDescription>
                      Add a new user story to the project.
                    </DialogDescription>
                  </DialogHeader>
                  <AddUserStoryForm
                    onUserStoryAdded={handleUserStoryAdded}
                    existingStoriesCount={userStories.length}
                    ticketPrefix={project.ticketPrefix || ''}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {storiesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : userStories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No user stories have been added to this project yet.
              </p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {userStories.map((story) => (
                  <AccordionItem value={`story-${story.id}`} key={story.id}>
                    <div className="flex items-center pr-4">
                      <AccordionTrigger className="hover:no-underline flex-1">
                        <div className="flex items-start gap-3 relative w-full">
                          <Ticket className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{story.title}</p>
                              <Badge variant="secondary">{story.ticketId}</Badge>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleEditClick(story)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Story</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleAddTaskClick(story)}>
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
                    </div>

                    <AccordionContent>
                      <div className="pl-8 pr-4 space-y-4 text-muted-foreground">
                        <div>
                          <h5 className="font-semibold text-foreground">Features</h5>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            {story.features.map((feature, i) => (
                              <li key={i}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                        <TasksList projectId={projectId} storyId={story.id} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {selectedStory && (
          <Dialog open={isEditStoryDialogOpen} onOpenChange={setIsEditStoryDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit User Story</DialogTitle>
                <DialogDescription>
                  Update the details for your user story.
                </DialogDescription>
              </DialogHeader>
              <EditUserStoryForm
                story={selectedStory}
                onUserStoryUpdated={handleUserStoryUpdated}
              />
            </DialogContent>
          </Dialog>
        )}

        {selectedStory && (
          <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Add a task for user story: <strong>{selectedStory.ticketId}</strong>
                </DialogDescription>
              </DialogHeader>
              <AddTaskForm
                onTaskAdded={handleTaskAdded}
                onTasksAdded={handleTasksAdded}
                userStoryTicketId={selectedStory.ticketId}
                existingTasksCount={selectedStory.tasks?.length || 0}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
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
