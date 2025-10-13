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
import type { Goal, Skill } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, Plus, Target, Calendar } from 'lucide-react';
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
import { AddGoalForm } from '@/components/skills/add-goal-form';

function formatDeadline(deadline: string | undefined) {
    if (!deadline) return '';
    const date = new Date(deadline);
    const now = new Date();
    // Adjust for timezone differences by comparing dates only
    date.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
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
  const router = useRouter();

  // In a real app, you'd fetch this from a database
  const initialSkill = initialSkills.find((s) => s.id === skillId);

  const [skill, setSkill] = useState<Skill | undefined>(initialSkill);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);

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
    setIsEditDialogOpen(false);
    // Note: This only updates the state on this page. The main skills list won't reflect changes
    // until we implement a shared state management or data fetching solution.
  };

  const handleGoalAdded = (newGoal: Goal) => {
    setSkill(prevSkill => prevSkill ? { ...prevSkill, goals: [...prevSkill.goals, newGoal] } : undefined);
    setIsAddGoalDialogOpen(false);
  }

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
            {skill.category}
          </Badge>
          <div className="flex items-center gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
          <Card>
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <CardTitle className="font-headline">Active Goals</CardTitle>
                     <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4"/> Add Goal</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Goal</DialogTitle>
                                <DialogDescription>
                                    Define a new SMART goal for {skill.name}.
                                </DialogDescription>
                            </DialogHeader>
                            <AddGoalForm onGoalAdded={handleGoalAdded} />
                        </DialogContent>
                    </Dialog>
                </div>
              <CardDescription>Specific, measurable, and time-bound objectives.</CardDescription>
            </CardHeader>
            <CardContent>
              {skill.goals.length > 0 ? (
                 <ul className="space-y-4">
                 {skill.goals.map((goal, index) => (
                   <li key={index} className="flex items-start gap-4">
                       <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                       <div className="flex-1">
                           <p className="font-semibold">{goal.description}</p>
                           {(goal.target || goal.deadline) && (
                               <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                               {goal.target && (<span>Target: {goal.target} {goal.unit}</span>)}
                               {goal.deadline && (
                                   <span className="flex items-center gap-1.5">
                                       <Calendar className="h-4 w-4" />
                                       {formatDeadline(goal.deadline)}
                                   </span>
                               )}
                               </div>
                           )}
                       </div>
                   </li>
                 ))}
               </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No goals defined yet. Click "Add Goal" to get started.</p>
              )}
            </CardContent>
          </Card>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Sub-Skills</CardTitle>
                <CardDescription>Smaller components of this skill.</CardDescription>
              </CardHeader>
              <CardContent>
                {skill.subSkills && skill.subSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {skill.subSkills.map((subSkill) => (
                            <Badge key={subSkill} variant="secondary">{subSkill}</Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">No sub-skills defined yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
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

        </div>
      </main>
    </div>
  );
}
