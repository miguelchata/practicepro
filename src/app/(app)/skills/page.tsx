'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { skills as initialSkills } from '@/lib/data';
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

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSkillAdded = (
    newSkill: Omit<Skill, 'id' | 'totalHours' | 'icon'>
  ) => {
    const newId = newSkill.name.toLowerCase().replace(/\s/g, '-');
    // For now, we'll use a default icon for new skills
    const { Target: NewIcon } = require('lucide-react');

    setSkills([
      ...skills,
      {
        ...newSkill,
        id: newId,
        totalHours: 0,
        icon: NewIcon,
      },
    ]);
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
    setSkills(prevSkills =>
      prevSkills.map(skill =>
        skill.id === skillId ? { ...skill, category: newCategory } : skill
      )
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Skills & Goals" />
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
        <Accordion type="multiple" defaultValue={categories} className="w-full space-y-4">
          {Object.entries(groupedSkills).map(([category, skillsInCategory]) => (
            <AccordionItem value={category} key={category} className="border-b-0">
                <AccordionTrigger className="text-xl font-headline font-bold tracking-tight rounded-lg bg-muted px-4 py-3 hover:no-underline">
                  {category} ({skillsInCategory.length})
                </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {skillsInCategory.map(skill => (
                    <Card key={skill.id}>
                      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                        <div className="flex items-center gap-4">
                          <skill.icon className="h-10 w-10 text-primary" />
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
                            Active Goals:
                          </p>
                          <ul className="list-inside space-y-1 text-sm text-muted-foreground">
                            {skill.goals.map((goal, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <TargetIcon className="h-4 w-4 mt-1 flex-shrink-0" />
                                <span>{goal.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/skills/${skill.id}`}>View Details</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  );
}
