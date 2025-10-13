'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { skills as initialSkills } from '@/lib/data';
import type { Skill } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditSkillForm } from '@/components/skills/edit-skill-form';

export default function SkillDetailPage() {
  const params = useParams();
  const { skillId } = params;
  const router = useRouter();

  // In a real app, you'd fetch this from a database
  const initialSkill = initialSkills.find((s) => s.id === skillId);

  const [skill, setSkill] = useState<Skill | undefined>(initialSkill);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!skill) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Skill Not Found" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
          <p>The skill you are looking for does not exist.</p>
          <Button asChild>
            <Link href="/skills">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Skills
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  const handleSkillUpdated = (updatedSkillData: Omit<Skill, 'id' | 'totalHours' | 'icon'>) => {
    // In a real app, this would also update the database.
    setSkill(prevSkill => prevSkill ? { ...prevSkill, ...updatedSkillData } : undefined);
    setIsDialogOpen(false);
    // Note: This only updates the state on this page. The main skills list won't reflect changes
    // until we implement a shared state management or data fetching solution.
  };


  const { icon: Icon } = skill;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={skill.name} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/skills">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
            {skill.name}
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            {skill.proficiency}
          </Badge>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Skill</DialogTitle>
                  <DialogDescription>
                    Update the details for your skill.
                  </DialogDescription>
                </DialogHeader>
                <EditSkillForm
                  skill={skill}
                  onSkillUpdated={handleSkillUpdated}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Icon className="h-6 w-6" />
                <span>About {skill.name}</span>
              </CardTitle>
              <CardDescription>
                Your progress and goals for this skill.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div>
                <p className="text-sm font-medium">
                  Total Time Practiced: {skill.totalHours} hours
                </p>
                <Progress
                  value={(skill.totalHours / 250) * 100}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(skill.totalHours / 250) * 100}% towards mastery (250 hours)
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="text-lg font-semibold font-headline">
                  Active Goals
                </h4>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
                  {skill.goals.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">
                Recent Practice Sessions
              </CardTitle>
              <CardDescription>
                Your last few sessions for this skill.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No recent sessions logged for this skill.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
