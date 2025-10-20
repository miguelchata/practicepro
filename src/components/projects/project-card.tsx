'use client';

import type { Project } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Calendar,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusVariant = (status: Project['status']) => {
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

  const isOverdue = new Date(project.targetDate) < new Date() && project.status !== 'Completed';

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Badge variant={getStatusVariant(project.status)}>
            {project.status}
          </Badge>
        </div>
        <div className="space-y-2 text-sm">
            <div className='flex items-center gap-2 text-muted-foreground'>
                <Calendar className='h-4 w-4' />
                <span>{format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.targetDate), 'MMM d, yyyy')}</span>
            </div>
             <div className="text-muted-foreground">
                Target: {' '}
                <span className={isOverdue ? 'font-semibold text-destructive' : ''}>
                    {formatDistanceToNow(new Date(project.targetDate), { addSuffix: true })}
                </span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
