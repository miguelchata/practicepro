'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Goal, GoalLevel, Skill, SubSkill } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Calendar,
  Clock,
  Puzzle,
  MoreVertical,
  Trash2,
  Timer,
  Check,
  ChevronRight,
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
import { Separator } from '@/components/ui/separator';
import { NextGoalForm } from '@/components/skills/next-goal-form';


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

const formatDuration = (seconds: number | undefined) => {
    if (seconds === undefined || seconds === null) return '';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
};

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { skillId } = params;
  const { data: skill, loading } = useDoc<Skill>(`skills/${skillId}`);
  
  const updateSkill = useUpdateSkill();

  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [nextGoalCandidate, setNextGoalCandidate] = useState<Goal | null>(null);
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
    if (!skill) return;

    let newSubSkills = [...skill.subSkills];

    newGoalsData.forEach(goalData => {
        const { skillArea, ...newGoal } = goalData;
        const subSkillIndex = newSubSkills.findIndex(sub => sub.name === skillArea);

        const goalToAdd = {
            ...newGoal,
            status: 'Not Started',
        } as Goal

        if (subSkillIndex !== -1) {
            // Add goal to existing subskill
            newSubSkills[subSkillIndex] = {
                ...newSubSkills[subSkillIndex],
                goals: [...newSubSkills[subSkillIndex].goals, goalToAdd],
            };
        } else {
            // Create new subskill and add goal
            const newSubSkill: SubSkill = {
                name: skillArea,
                goals: [goalToAdd]
            };
            newSubSkills.push(newSubSkill);
        }
    });

    updateSkill(skill.id, { subSkills: newSubSkills });
    setIsAddGoalDialogOpen(false);
    setNextGoalCandidate(null);
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
                    <h2 className="text-2xl font-bold tracking-tight font-headline">Skill Goals</h2>
                    <p className="text-muted-foreground">Manage and track the specific goals for your skill.</p>
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
            <Button variant="default" size="sm" onClick={handleOpenAddGoalDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
            </Button>
        </div>
        
        {filteredGoals.length > 0 ? (
             <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredGoals.map((goal, goalIndex) => (
                    <Card key={goalIndex} className="flex flex-col">
                        <CardContent className="p-4 flex-grow flex flex-col">
                            <GoalDetail 
                                skill={skill} 
                                goal={goal} 
                                onGoalDeleted={handleGoalDeleted}
                                onNextGoal={() => setNextGoalCandidate(goal)}
                            />
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

        {/* Next Goal Dialog */}
        <Dialog open={!!nextGoalCandidate} onOpenChange={(open) => !open && setNextGoalCandidate(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>What's Your Next Goal?</DialogTitle>
                     <DialogDescription>
                        Define the next goal for &quot;{nextGoalCandidate?.subSkillName}&quot;. The level will remain {nextGoalCandidate?.level}.
                    </DialogDescription>
                </DialogHeader>
                {nextGoalCandidate && (
                    <NextGoalForm
                        onGoalAdded={handleGoalAdded}
                        skillArea={nextGoalCandidate.subSkillName || ''}
                        level={nextGoalCandidate.level}
                    />
                )}
            </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

type GoalDetailProps = {
  skill: Skill;
  goal: Goal & { subSkillName?: string };
  onGoalDeleted: (goalTitle: string, subSkillName: string) => void;
  onNextGoal: () => void;
};

const getLevelVariant = (level: GoalLevel | undefined) => {
    switch (level) {
        case 'Junior':
            return 'default';
        case 'Semi Senior':
            return 'secondary';
        case 'Senior':
            return 'destructive';
        default:
            return 'outline';
    }
};

const GoalDetail = ({ skill, goal, onGoalDeleted, onNextGoal }: GoalDetailProps) => {

    const practiceUrl = useMemo(() => {
        const params = new URLSearchParams();
        params.set('skillId', skill.id);
        params.set('skillName', skill.name);
        if (goal.subSkillName) {
            params.set('subSkill', goal.subSkillName);
        }
        if (goal.specific) {
            params.set('goal', goal.specific);
        }
        if (goal.targetDuration) {
            params.set('type', 'timed');
            params.set('duration', String(goal.targetDuration * 60));
        }
        return `/practice/active?${params.toString()}`;
    }, [skill.id, skill.name, goal]);

    return (
    <div className="space-y-4 flex flex-col flex-grow">
        <div className="space-y-2 flex-grow">
            <p className="font-medium">{goal.title}</p>
            <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-4 gap-y-1">
                {goal.targetDuration && (
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {goal.targetDuration} minutes
                    </span>
                )}
                {goal.deadline && (
                    <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Due {formatDeadline(goal.deadline)}
                    </span>
                )}
                {goal.status === 'Completed' && goal.duration && (
                     <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Check className="h-4 w-4 text-green-500" />
                        {formatDuration(goal.duration)}
                    </span>
                )}
            </div>
             <div className="flex items-center gap-2 pt-2">
                {goal.subSkillName && (
                    <Badge variant="secondary" className="gap-1.5"><Puzzle className="h-3 w-3"/>{goal.subSkillName}</Badge>
                )}
                 {goal.level && (
                    <Badge variant={getLevelVariant(goal.level)}>{goal.level}</Badge>
                )}
                <Badge variant={goal.status === 'Completed' ? 'default' : 'secondary'}>{goal.status}</Badge>
            </div>
            <div className="pt-2">
              {goal.status === 'Completed' && goal.feedback ? (
                <>
                  <h5 className="font-semibold text-foreground">Feedback</h5>
                  <p className="text-sm mt-1 text-muted-foreground">{goal.feedback}</p>
                </>
              ) : (
                <>
                  <h5 className="font-semibold text-foreground">Outcome</h5>
                  <p className="text-sm mt-1 text-muted-foreground">{goal.measurable}</p>
                </>
              )}
            </div>
        </div>
        
        <Separator />

        <div className="flex items-center justify-between">
             <AlertDialog>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-muted-foreground">
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
            {goal.status === 'Completed' ? (
                 <Button variant="secondary" size="sm" onClick={onNextGoal}>
                    Next Goal
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button variant="outline" size="sm" asChild>
                    <Link href={practiceUrl}>
                        <Timer className="mr-2 h-4 w-4" />
                        Practice
                    </Link>
                </Button>
            )}
        </div>
    </div>
    )
};
