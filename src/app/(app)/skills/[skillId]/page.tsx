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
import type { Goal, Skill, SubSkill } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Calendar,
  Clock,
  Puzzle,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AddGoalForm } from '@/components/skills/add-goal-form';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useUpdateSkill } from '@/firebase/firestore/use-add-skill';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const router = useRouter();
  const { skillId } = params;
  const { data: skill, loading } = useDoc<Skill>(`skills/${skillId}`);
  
  const updateSkill = useUpdateSkill();

  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  
  const allGoals = useMemo(() => {
    return skill?.subSkills.flatMap(sub => sub.goals.map(goal => ({...goal, subSkillName: sub.name}))) || [];
  }, [skill]);

  const filteredGoals = useMemo(() => {
    if (filter === 'All') {
      return allGoals;
    }
    return allGoals.filter(goal => goal.subSkillName === filter);
  }, [allGoals, filter]);

  if (loading) {
      return (
          <div className="flex min-h-screen w-full flex-col">
              <Header title="Loading Skill..." />
              <main className="flex-1 p-4 md:p-8">
                  <div className="space-y-6">
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
          <Button onClick={() => router.push('/skills')}>
              Back to Skills
          </Button>
        </main>
      </div>
    );
  }

  const handleGoalAdded = (newGoalsData: (Omit<Goal, 'projectId' | 'userStoryId' | 'userStoryTicketId'> & { skillArea: string })[]) => {
    
    let newSubSkills = [...skill.subSkills];

    newGoalsData.forEach(goalData => {
        const { skillArea, ...newGoal } = goalData;
        const subSkillIndex = newSubSkills.findIndex(sub => sub.name === skillArea);

        if (subSkillIndex !== -1) {
            newSubSkills[subSkillIndex] = {
                ...newSubSkills[subSkillIndex],
                goals: [...newSubSkills[subSkillIndex].goals, newGoal as Goal],
            };
        }
    });

    updateSkill(skill.id, { subSkills: newSubSkills });
    setIsAddGoalDialogOpen(false);
  };
  
  const handleGoalDeleted = (goalTitle: string, subSkillName: string) => {
    const newSubSkills: SubSkill[] = skill.subSkills.map(subSkill => {
        if (subSkill.name === subSkillName) {
            return {
                ...subSkill,
                goals: subSkill.goals.filter(goal => goal.title !== goalTitle)
            };
        }
        return subSkill;
    });
    updateSkill(skill.id, { subSkills: newSubSkills });
  };
  
  const handleOpenAddGoalDialog = () => {
    setIsAddGoalDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={skill.name} backButtonHref="/skills" />
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        
        <div className="flex items-center justify-between">
            <div className='flex items-center gap-4'>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight font-headline">Active Goals</h2>
                    <p className="text-muted-foreground">Your specific targets for mastering {skill.name}.</p>
                </div>
                 <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by skill area" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {skill.subSkills.map((sub) => (
                            <SelectItem key={sub.name} value={sub.name}>{sub.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button variant="default" size="sm" onClick={handleOpenAddGoalDialog} disabled={skill.subSkills.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
            </Button>
        </div>
        
        {filteredGoals.length > 0 ? (
             <div className="space-y-6">
                {filteredGoals.map((goal, goalIndex) => (
                    <Card key={goalIndex}>
                        <CardContent className="p-4">
                            <GoalDetail goal={goal} onGoalDeleted={handleGoalDeleted} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                <p>No goals found for this filter. Add a goal to get started.</p>
            </div>
        )}

        {/* Add Goal Dialog */}
        <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
              <DialogDescription>
                Define a new goal and link it to a skill area. You can add one or multiple via JSON.
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

type GoalDetailProps = {
  goal: Goal & { subSkillName?: string };
  onGoalDeleted: (goalTitle: string, subSkillName: string) => void;
};

const GoalDetail = ({ goal, onGoalDeleted }: GoalDetailProps) => (
    <div className="space-y-4">
        <div className="flex items-start gap-3 relative w-full">
            
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
                </div>
            </div>
            
            <AlertDialog>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Goal</span>
                          </DropdownMenuItem>
                      </AlertDialogTrigger>
                  </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action will permanently delete the goal: <strong>{goal.title}</strong>. This cannot be undone.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onGoalDeleted(goal.title, goal.subSkillName || '')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
        <div className="space-y-4 text-muted-foreground">
            <div className="flex items-center gap-2">
                {goal.subSkillName && (
                    <Badge variant="secondary" className="gap-1.5"><Puzzle className="h-3 w-3"/>{goal.subSkillName}</Badge>
                )}
                <Badge variant={goal.status === 'Completed' ? 'default' : 'secondary'}>{goal.status}</Badge>
            </div>
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
