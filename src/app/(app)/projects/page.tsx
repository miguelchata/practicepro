import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
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
          <Button asChild>
            <Link href="/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Project
            </Link>
          </Button>
        </div>

        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardHeader>
            <CardTitle>No Projects Yet</CardTitle>
            <CardDescription>
              Create a project to start organizing your goals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/projects/new">Create Your First Project</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
