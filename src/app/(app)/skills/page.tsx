'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MoreHorizontal, PlusCircle, TargetIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddSkillForm } from '@/components/skills/add-skill-form';
import type { Skill } from '@/lib/types';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSkills } from '@/firebase/firestore/use-collection';
import { useAddSkill, useUpdateSkill } from '@/firebase/firestore/use-add-skill';
import { Skeleton } from '@/components/ui/skeleton';
import { iconMap } from '@/lib/icons';

export default function SkillsPage() {
  const { data: skills, loading } = useSkills();
  const addSkill = useAddSkill();
  const updateSkill = useUpdateSkill();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSkillAdded = async (
    newSkill: Omit<Skill, 'id' | 'totalHours' | 'userId' | 'subSkills'>
  ) => {
    await addSkill(newSkill);
    setIsDialogOpen(false);
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const categories = Object.keys(groupedSkills);

  const handleCategoryChange = (skillId: string, newCategory: string) => {
    updateSkill(skillId, { category: newCategory });
  };
  
  const allGoals = (skill: Skill) => skill.subSkills.flatMap(sub => sub.goals);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Skills" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">
              Your Skills
            </h2>
            <p className="text-muted-foreground">
              Manage your skills and track your goals.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Skill</DialogTitle>
                <DialogDescription>
                  What new skill do you want to master?
                </DialogDescription>
              </DialogHeader>
              <AddSkillForm
                onSkillAdded={handleSkillAdded}
                categories={categories}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
                </div>
            </div>
        ) : (
            <Accordion type="multiple" defaultValue={categories} className="w-full space-y-4">
            {Object.entries(groupedSkills).map(([category, skillsInCategory]) => (
                <AccordionItem value={category} key={category} className="border-b-0">
                    <AccordionTrigger className="text-xl font-headline font-bold tracking-tight rounded-lg bg-muted px-4 py-3 hover:no-underline">
                    {category} ({skillsInCategory.length})
                    </AccordionTrigger>
                <AccordionContent className="pt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {skillsInCategory.map(skill => {
                        const Icon = iconMap[skill.icon] || TargetIcon;
                        return (
                        <Card key={skill.id}>
                        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                            <div className="flex items-center gap-4">
                            <Icon className="h-10 w-10 text-primary" />
                            <div>
                                <CardTitle className="font-headline">
                                {skill.name}
                                </CardTitle>
                            </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Move to</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {categories.filter(c => c !== category).map(c => (
                                        <DropdownMenuItem key={c} onClick={() => handleCategoryChange(skill.id, c)}>
                                            {c}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Total Time: {skill.totalHours} hours
                            </p>
                            <Progress value={(skill.totalHours / 250) * 100} />
                             <p className="text-sm font-medium pt-2">
                                Active Goals: {allGoals(skill).length}
                            </p>
                            <ul className="list-inside space-y-1 text-sm text-muted-foreground">
                                {allGoals(skill).slice(0,2).map((goal, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-2"
                                >
                                    <TargetIcon className="h-4 w-4 mt-1 flex-shrink-0" />
                                    <span className="truncate">{goal.title}</span>
                                </li>
                                ))}
                                {allGoals(skill).length > 2 && <li className="text-xs">...and {allGoals(skill).length-2} more</li>}
                            </ul>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                            <Link href={`/skills/${skill.id}`}>View Details</Link>
                            </Button>
                        </CardFooter>
                        </Card>
                        )
                    })}
                    </div>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        )}
      </main>
    </div>
  );
}
