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
import { PlusCircle, Target as TargetIcon } from 'lucide-react';
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

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSkillAdded = (newSkill: Omit<Skill, 'id' | 'totalHours' | 'icon'>) => {
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
              <AddSkillForm onSkillAdded={handleSkillAdded} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <skill.icon className="h-10 w-10 text-primary" />
                <div>
                  <CardTitle className="font-headline">{skill.name}</CardTitle>
                  <CardDescription>{skill.category}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Total Time: {skill.totalHours} hours
                  </p>
                  <Progress value={(skill.totalHours / 250) * 100} />
                  <p className="text-sm font-medium pt-2">Active Goals:</p>
                  <ul className="list-inside space-y-1 text-sm text-muted-foreground">
                    {skill.goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2">
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
      </main>
    </div>
  );
}
