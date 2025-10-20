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

export default function ProjectsPage() {
  // In a real app, you'd fetch this from a database.
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProjectAdded = (newProject: Omit<Project, 'id'>) => {
    setProjects(prev => [...prev, { ...newProject, id: `proj-${Date.now()}` }]);
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

        {projects.length === 0 ? (
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
