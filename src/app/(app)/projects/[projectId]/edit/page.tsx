'use client';

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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { EditProjectForm } from '@/components/projects/edit-project-form';
import { useUpdateProject } from '@/firebase/firestore/use-update-project';
import type { Project, ProjectStatus } from '@/lib/types';

type ProjectUpdateData = {
  title: string;
  description: string;
  startDate: string;
  targetDate: string;
  status: ProjectStatus;
}

export default function EditProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const { data: project, loading } = useProject(projectId);
  const updateProject = useUpdateProject();

  const handleProjectUpdated = async (updatedData: ProjectUpdateData) => {
    await updateProject(projectId, updatedData);
    router.push(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Loading Project..." />
        <main className="flex flex-1 items-center justify-center p-4">
          <Skeleton className="h-[500px] w-full max-w-3xl" />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Project Not Found" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Edit: ${project.title}`} />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Edit Project</CardTitle>
            <CardDescription>Update the details for your project below.</CardDescription>
          </CardHeader>
          <CardContent>
            <EditProjectForm project={project} onProjectUpdated={handleProjectUpdated} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
