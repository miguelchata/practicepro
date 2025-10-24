'use client';

import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ProjectStatus, UserStory, UserStoryStatus } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddUserStoryForm } from '@/components/projects/add-user-story-form';
import { useAddUserStory } from '@/firebase/firestore/use-add-user-story';
import { useUserStories } from '@/firebase/firestore/use-collection';
import { useUpdateUserStory } from '@/firebase/firestore/use-update-user-story';
import { UserStoryCard } from '@/components/projects/user-story-card';

const KANBAN_COLUMNS: UserStoryStatus[] = [
  'Backlog',
  'To Do',
  'In Progress',
  'Done',
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project, loading } = useProject(projectId);
  const { data: userStories, loading: storiesLoading } = useUserStories(projectId);
  const addUserStory = useAddUserStory();
  const updateUserStory = useUpdateUserStory();

  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);

  const storiesByStatus = useMemo(() => {
    const grouped: Record<UserStoryStatus, UserStory[]> = {
      Backlog: [],
      'To Do': [],
      'In Progress': [],
      Done: [],
    };
    userStories.forEach((story) => {
      if (story.status) {
        grouped[story.status].push(story);
      } else {
        grouped.Backlog.push(story); // Default to backlog
      }
    });
    return grouped;
  }, [userStories]);

  const handleUserStoryAdded = async (newUserStory: Omit<UserStory, 'id'>) => {
    await addUserStory(projectId, newUserStory);
    setIsAddStoryDialogOpen(false);
  };
  
  const handleDragEnd = (story: UserStory, newStatus: UserStoryStatus) => {
    if (story.status !== newStatus) {
      updateUserStory(projectId, story.id, { status: newStatus });
    }
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
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">User Stories</h2>
            <p className="text-muted-foreground">
              Drag and drop stories to change their status.
            </p>
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
        
        {storiesLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {KANBAN_COLUMNS.map(col => (
                  <div key={col} className="p-2 bg-muted rounded-lg">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-24 w-full" />
                  </div>
              ))}
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {KANBAN_COLUMNS.map((status) => (
              <div
                key={status}
                className="rounded-lg bg-muted/50 p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  const storyData = window.localStorage.getItem('draggingStory');
                  if (storyData) {
                    const story: UserStory = JSON.parse(storyData);
                    handleDragEnd(story, status);
                    window.localStorage.removeItem('draggingStory');
                  }
                }}
              >
                <h3 className="font-semibold font-headline mb-3 flex items-center justify-between">
                  <span>{status}</span>
                  <span className="text-sm text-muted-foreground bg-background rounded-full px-2 py-0.5">
                    {storiesByStatus[status].length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {storiesByStatus[status].map((story) => (
                    <UserStoryCard
                      key={story.id}
                      story={story}
                      projectId={projectId}
                    />
                  ))}
                  {storiesByStatus[status].length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                      Drop stories here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
