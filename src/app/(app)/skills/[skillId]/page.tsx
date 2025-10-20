'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { skills as initialSkills } from '@/lib/data';
import type { Goal, Skill, SubSkill } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Plus,
  Target,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditSkillForm } from '@/components/skills/edit-skill-form';
import { AddGoalForm } from '@/components/skills/add-goal-form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

export default function SkillDetailPage() {
  const params = useParams();
  const { skillId } = params;

  // In a real app, you'd fetch this from a database
  const initialSkill = initialSkills.find((s) => s.id === skillId);

  const [skill, setSkill] = useState<Skill | undefined>(initialSkill);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [activeSubSkill, setActiveSubSkill] = useState<string | null>(null);

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

  const handleSkillUpdated = (updatedSkillData: Pick<Skill, 'name' | 'category'>) => {
    setSkill(prev => (prev ? { ...prev, ...updatedSkillData } : undefined));
    setIsEditDialogOpen(false);
  };

  const handleGoalAdded = (newGoal: Goal) => {
    if (!activeSubSkill) return;

    setSkill(prevSkill => {
      if (!prevSkill) return undefined;
      const newSubSkills = prevSkill.subSkills.map(sub => {
        if (sub.name === activeSubSkill) {
          return { ...sub, goals: [...sub.goals, newGoal] };
        }
        return sub;
      });
      return { ...prevSkill, subSkills: newSubSkills };
    });
    setIsAddGoalDialogOpen(false);
    setActiveSubSkill(null);
  };
  
  const handleOpenAddGoalDialog = (subSkillName: string) => {
    setActiveSubSkill(subSkillName);
    setIsAddGoalDialogOpen(true);
  };

  const { icon: Icon } = skill;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={skill.name} />
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/skills">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <Icon className="h-8 w-8 text-primary" />
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-2xl font-semibold tracking-tight sm:grow-0 font-headline">
            {skill.name}
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            {skill.category}
          </Badge>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Skill</DialogTitle>
                <DialogDescription>
                  Update the details for your skill.
                </DialogDescription>
              </DialogHeader>
              <EditSkillForm skill={skill} onSkillUpdated={handleSkillUpdated} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: Progress and Recent Activity */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  Total Time Practiced: {skill.totalHours} hours
                </p>
                <Progress value={(skill.totalHours / 250) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {(skill.totalHours / 250) * 100}% towards mastery (250 hours)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No recent sessions logged for this skill yet.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sub-Skills and Goals */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sub-Skills & Goals</CardTitle>
                <CardDescription>
                  Break down your skill and set specific targets for each component.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {skill.subSkills.length > 0 ? (
                  skill.subSkills.map((sub, index) => (
                    <div key={index} className="rounded-lg border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{sub.name}</h4>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenAddGoalDialog(sub.name)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Goal
                        </Button>
                      </div>
                      <div className="mt-4 space-y-3 pl-2 border-l-2 border-primary/20 ml-2">
                        {sub.goals.length > 0 ? (
                            <Accordion type="multiple" className="w-full">
                                {sub.goals.map((goal, goalIndex) => (
                                    <AccordionItem value={`item-${goalIndex}`} key={goalIndex}>
                                        <AccordionTrigger className="hover:no-underline">
                                             <div className="flex items-start gap-3 relative w-full">
                                                <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 absolute -left-[1.1rem] bg-card rounded-full p-0.5" />
                                                <div className="flex-1 pl-4 text-left">
                                                    <p className="font-medium">{goal.specific}</p>
                                                     {goal.deadline && (
                                                    <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-4 gap-y-1 mt-1">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-4 w-4" />
                                                            Due {formatDeadline(goal.deadline)}
                                                        </span>
                                                    </div>
                                                     )}
                                                </div>
                                             </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="pl-8 pr-4 space-y-2 text-muted-foreground">
                                                <p><strong className="text-foreground">Measurable:</strong> {goal.measurable}</p>
                                                <p><strong className="text-foreground">Achievable:</strong> {goal.achievable}</p>
                                                <p><strong className="text-foreground">Relevant:</strong> {goal.relevant}</p>
                                                <p><strong className="text-foreground">Time-bound:</strong> {goal.timeBound}</p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                           </Accordion>
                        ) : (
                          <p className="text-sm text-muted-foreground pl-4">
                            No goals yet for this sub-skill.
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No sub-skills defined yet. Edit the skill to add some.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Goal Dialog */}
        <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New SMART Goal for {activeSubSkill}</DialogTitle>
              <DialogDescription>
                Define a new goal using the SMART framework.
              </DialogDescription>
            </DialogHeader>
            <AddGoalForm onGoalAdded={handleGoalAdded} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
