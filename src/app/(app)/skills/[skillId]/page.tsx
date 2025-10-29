'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Goal, Skill, UserStory, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Target,
  Calendar,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddGoalForm } from '@/components/skills/add-goal-form';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useUpdateSkill } from '@/firebase/firestore/use-add-skill';
import { Skeleton } from '@/components/ui/skeleton';

function formatDeadline(deadline: string | undefined) {
  if (!deadline) return '';
  const date = new Date(deadline);
  const now = new Date();
  // Adjust for timezone differences by comparing dates only
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `in ${diffDays} days`;
}

type GroupedGoals = {
    [skillArea: string]: Goal[];
}


export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { skillId } = params;
  const { data: skill, loading } = useDoc<Skill>(`skills/${skillId}`);
  
  const updateSkill = useUpdateSkill();

  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  
  const allGoals = useMemo(() => {
    return skill?.subSkills.flatMap(sub => sub.goals.map(goal => ({...goal, subSkillName: sub.name}))) || [];
  }, [skill]);

  const groupedGoals = useMemo(() => {
    return allGoals.reduce((acc, goal) => {
        const skillArea = goal.subSkillName || 'Uncategorized';
        if (!acc[skillArea]) {
            acc[skillArea] = [];
        }
        acc[skillArea].push(goal);
        return acc;
    }, {} as GroupedGoals);
  }, [allGoals]);


  if (loading) {
      return (
          <div className="flex min-h-screen w-full flex-col">
              <Header title="Loading Skill..." />
              <main className="flex-1 p-4 md:p-8">
                  <div className="grid gap-6">
                      <Skeleton className="h-40 w-full" />
                      <Skeleton className="h-48 w-full" />
                  </div>
              </main>
          </div>
      )
  }

  if (!skill) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Skill Not Found" backButtonHref="/skills" />
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

  const handleGoalAdded = (skillArea: string, newGoal: Omit<Goal, 'projectId' | 'userStoryId' | 'userStoryTicketId'>) => {
    if (!skillArea) return;

    const newSubSkills = skill.subSkills.map(sub => {
      if (sub.name === skillArea) {
        return { ...sub, goals: [...sub.goals, newGoal as Goal] };
      }
      return sub;
    });
    updateSkill(skill.id, { subSkills: newSubSkills });
    setIsAddGoalDialogOpen(false);
  };
  
  const handleOpenAddGoalDialog = () => {
    setIsAddGoalDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={skill.name} backButtonHref="/skills" />
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">Active Goals</h2>
                <p className="text-muted-foreground">Your specific targets for mastering {skill.name}.</p>
            </div>
            <Button variant="default" size="sm" onClick={handleOpenAddGoalDialog} disabled={skill.subSkills.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
            </Button>
        </div>
        
        {allGoals.length > 0 ? (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
                {Object.entries(groupedGoals).map(([skillArea, goals]) => (
                    <Card key={skillArea}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-semibold text-base">
                                <Target className="h-5 w-5" />
                                <span>{skillArea}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {goals.map((goal, goalIndex) => (
                                <div key={goalIndex} className="rounded-lg border bg-background/50">
                                    <GoalDetail goal={goal} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                <p>No goals defined yet. Add a goal to get started.</p>
            </div>
        )}

        {/* Add Goal Dialog */}
        <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
              <DialogDescription>
                Define a new goal and link it to a skill area.
              </DialogDescription>
            </DialogHeader>
            <AddGoalForm 
                onGoalAdded={handleGoalAdded} 
                skillAreas={skill.subSkills.map(s => s.name)} 
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

const GoalDetail = ({ goal }: { goal: Goal & { subSkillName?: string } }) => (
    <div className="p-4">
        <div className="flex items-start gap-3 relative w-full">
            <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
                <p className="font-medium">{goal.title}</p>
                <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-4 gap-y-1 mt-1">
                    {goal.duration && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {goal.duration} minutes
                        </span>
                    )}
                    {goal.deadline && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            Due {formatDeadline(goal.deadline)}
                        </span>
                    )}
                    <Badge variant={goal.status === 'Completed' ? 'default' : 'secondary'}>{goal.status}</Badge>
                </div>
            </div>
        </div>
        <div className="pl-8 pt-4 space-y-4 text-muted-foreground">
            <div>
                <h5 className="font-semibold text-foreground">Outcome</h5>
                 <ul className="list-none space-y-1 mt-1">
                    <li className="flex items-start gap-2">
                        <span>{goal.measurable}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
);
