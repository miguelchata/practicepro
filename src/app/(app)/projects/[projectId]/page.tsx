'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ProjectStatus, UserStory } from '@/lib/types';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project, loading } = useProject(projectId);
  const { data: userStories, loading: storiesLoading } = useUserStories(projectId);
  const addUserStory = useAddUserStory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUserStoryAdded = async (newUserStory: Omit<UserStory, 'id'>) => {
    await addUserStory(projectId, newUserStory);
    setIsDialogOpen(false);
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
                <span>Status: <strong>{project.status}</strong></span>
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
               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  <AddUserStoryForm onUserStoryAdded={handleUserStoryAdded} />
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
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-start gap-3 relative w-full">
                                    <Ticket className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">{story.title}</p>
                                        <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-4 gap-y-1 mt-1">
                                            <Badge variant="secondary">{story.ticketId}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
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
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
