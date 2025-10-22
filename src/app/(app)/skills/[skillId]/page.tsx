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
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Plus,
  Target,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Trash2,
  Ticket,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useProjects, useUserStoriesForProjects } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useUpdateSkill, useDeleteSkill } from '@/firebase/firestore/use-add-skill';
import { Skeleton } from '@/components/ui/skeleton';
import { iconMap } from '@/lib/icons';
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
    [projectId: string]: {
        project: Project | null;
        tickets: {
            [ticketId: string]: {
                ticket: UserStory | null;
                goals: Goal[];
            }
        },
        projectOnlyGoals: Goal[];
    }
}


export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { skillId } = params;
  const { data: skill, loading } = useDoc<Skill>(`skills/${skillId}`);
  const { data: projects } = useProjects();
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const userStoriesByProject = useUserStoriesForProjects(projectIds);
  
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [selectedSubSkills, setSelectedSubSkills] = useState<string[]>([]);

  if (loading) {
      return (
          <div className="flex min-h-screen w-full flex-col">
              <Header title="Loading Skill..." />
              <main className="flex-1 p-4 md:p-8">
                  <Skeleton className="h-10 w-48 mb-6" />
                  <div className="grid gap-6 md:grid-cols-3">
                      <div className="md:col-span-1 space-y-6">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                      <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-64 w-full" />
                      </div>
                  </div>
              </main>
          </div>
      )
  }

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

  const handleSkillUpdated = (updatedSkillData: Partial<Omit<Skill, 'id' | 'userId'>>) => {
    updateSkill(skill.id, updatedSkillData);
    setIsEditDialogOpen(false);
  };

  const handleGoalAdded = (newGoal: Goal) => {
    if (selectedSubSkills.length === 0) return;

    const newSubSkills = skill.subSkills.map(sub => {
      if (selectedSubSkills.includes(sub.name)) {
        return { ...sub, goals: [...sub.goals, newGoal] };
      }
      return sub;
    });
    updateSkill(skill.id, { subSkills: newSubSkills });
    setIsAddGoalDialogOpen(false);
    setSelectedSubSkills([]);
  };
  
  const handleOpenAddGoalDialog = () => {
    if (skill.subSkills && skill.subSkills.length > 0) {
      setSelectedSubSkills([skill.subSkills[0].name]);
    } else {
      setSelectedSubSkills([]);
    }
    setIsAddGoalDialogOpen(true);
  };

  const handleSubSkillSelectionChange = (subSkillName: string, isSelected: boolean) => {
    setSelectedSubSkills(prev => 
      isSelected 
        ? [...prev, subSkillName]
        : prev.filter(name => name !== subSkillName)
    );
  };

  const handleDeleteSkill = () => {
    deleteSkill(skill.id).then(() => {
        router.push('/skills');
    });
  }

  const allGoals = skill.subSkills.flatMap(sub => sub.goals.map(goal => ({...goal, subSkillName: sub.name})));
  
  const groupedGoals = useMemo(() => {
    return allGoals.reduce((acc, goal) => {
        const projectId = goal.projectId || 'personal';

        if (!acc[projectId]) {
            acc[projectId] = {
                project: projects.find(p => p.id === projectId) || null,
                tickets: {},
                projectOnlyGoals: []
            };
        }

        if (goal.userStoryTicketId && goal.userStoryId) {
            if (!acc[projectId].tickets[goal.userStoryTicketId]) {
                const stories = userStoriesByProject[projectId] || [];
                acc[projectId].tickets[goal.userStoryTicketId] = {
                    ticket: stories.find(s => s.id === goal.userStoryId) || null,
                    goals: []
                };
            }
            acc[projectId].tickets[goal.userStoryTicketId].goals.push(goal);
        } else if (goal.projectId) {
            acc[projectId].projectOnlyGoals.push(goal);
        } else {
             acc[projectId].projectOnlyGoals.push(goal);
        }

        return acc;
    }, {} as GroupedGoals);
  }, [allGoals, projects, userStoriesByProject]);

  const Icon = iconMap[skill.icon] || Target;

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
                <EditSkillForm skill={skill} onSkillUpdated={handleSkillUpdated} />
                </DialogContent>
            </Dialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the <strong>{skill.name}</strong> skill and all its associated data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSkill} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
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
                  {Math.round((skill.totalHours / 250) * 100)}% towards mastery (250 hours)
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Sub-Skills</CardTitle>
                  <CardDescription>
                    The core components of {skill.name}.
                  </CardDescription>
                </div>
                 <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Add Sub-skill
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Skill</DialogTitle>
                      <DialogDescription>
                        Add or modify your sub-skills below.
                      </DialogDescription>
                    </DialogHeader>
                    <EditSkillForm skill={skill} onSkillUpdated={handleSkillUpdated} />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {skill.subSkills && skill.subSkills.length > 0 ? (
                  skill.subSkills.map((sub, index) => (
                    <Badge key={index} variant="secondary" className="text-base py-1 px-3">
                      {sub.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4 w-full">
                    No sub-skills defined yet. Click &quot;Add Sub-skill&quot; to get started.
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Active Goals</CardTitle>
                        <CardDescription>Your specific targets for mastering {skill.name}.</CardDescription>
                    </div>
                    <Button variant="default" size="sm" onClick={handleOpenAddGoalDialog} disabled={skill.subSkills.length === 0}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Goal
                    </Button>
                </CardHeader>
                <CardContent>
                    {allGoals.length > 0 ? (
                        <Accordion type="multiple" className="w-full space-y-2">
                            {Object.entries(groupedGoals).map(([projectId, { project, tickets, projectOnlyGoals }]) => (
                                <AccordionItem value={`project-${projectId}`} key={projectId} className="rounded-lg border bg-muted/50 px-3">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2 font-semibold text-base">
                                            {project ? <FolderKanban className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                                            <span>{project?.title || 'Personal Goals'}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-2 space-y-2">
                                        {Object.entries(tickets).map(([ticketId, { ticket, goals }]) => (
                                            <Accordion key={ticketId} type="multiple" className="w-full space-y-1">
                                                <AccordionItem value={`ticket-${ticketId}`} className="rounded-lg border bg-background/50 px-3">
                                                    <AccordionTrigger>
                                                        <div className="flex items-center gap-2 font-medium">
                                                            <Ticket className="h-5 w-5" />
                                                            <span>{ticketId}: {ticket?.title || '...'}</span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="p-2 space-y-2">
                                                        {goals.map((goal, goalIndex) => (
                                                            <GoalDetail key={goalIndex} goal={goal} />
                                                        ))}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        ))}
                                        {projectOnlyGoals.map((goal, goalIndex) => (
                                            <div key={goalIndex} className="rounded-lg border bg-background/50">
                                                <GoalDetail goal={goal} />
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No goals defined yet. Add a goal to get started.
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
              <DialogTitle>Add New Goal</DialogTitle>
              <DialogDescription>
                Define a new goal and link it to one or more sub-skills.
              </DialogDescription>
            </DialogHeader>
            {skill.subSkills && skill.subSkills.length > 0 && (
              <div className="space-y-4 py-4">
                <Label>Link to Sub-Skill(s)</Label>
                <div className="space-y-2 rounded-md border p-4">
                    {skill.subSkills.map(sub => (
                      <div key={sub.name} className="flex items-center gap-3">
                        <Checkbox 
                          id={`subskill-checkbox-${sub.name}`}
                          checked={selectedSubSkills.includes(sub.name)}
                          onCheckedChange={(checked) => handleSubSkillSelectionChange(sub.name, !!checked)}
                        />
                        <Label htmlFor={`subskill-checkbox-${sub.name}`} className="font-normal cursor-pointer">
                          {sub.name}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <AddGoalForm onGoalAdded={handleGoalAdded} disabled={selectedSubSkills.length === 0} projects={projects} />
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
                    {goal.subSkillName && <Badge variant="secondary">{goal.subSkillName}</Badge>}
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
                <h5 className="font-semibold text-foreground">Specific</h5>
                <p>{goal.specific}</p>
            </div>
            <div>
                <h5 className="font-semibold text-foreground">Measurable</h5>
                <ul className="list-none space-y-1 mt-1">
                    {(Array.isArray(goal.measurable) ? goal.measurable : [goal.measurable]).map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

    