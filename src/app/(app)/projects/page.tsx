'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { AddProjectForm } from '@/components/projects/add-project-form';
import type { Project } from '@/lib/types';
import { ProjectCard } from '@/components/projects/project-card';
import { useProjects } from '@/firebase/firestore/use-collection';
import { useAddProject } from '@/firebase/firestore/use-add-project';
import { Skeleton } from '@/components/ui/skeleton';


export default function ProjectsPage() {
  const { data: projects, loading } = useProjects();
  const addProject = useAddProject();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProjectAdded = async (newProject: Omit<Project, 'id' | 'goals' | 'userId'>) => {
    await addProject(newProject);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Projects" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">
              Your Projects
            </h2>
            <p className="text-muted-foreground">
              Group your goals into larger projects to track your progress.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">New Project Details</DialogTitle>
                <DialogDescription>
                  Define your new project to start tracking it.
                </DialogDescription>
              </DialogHeader>
              <AddProjectForm onProjectAdded={handleProjectAdded} />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardHeader>
              <CardTitle>No Projects Yet</CardTitle>
              <CardDescription>
                Create a project to start organizing your goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create Your First Project</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">New Project Details</DialogTitle>
                    <DialogDescription>
                      Define your new project to start tracking it.
                    </DialogDescription>
                  </DialogHeader>
                  <AddProjectForm onProjectAdded={handleProjectAdded} />
                </DialogContent>
               </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
