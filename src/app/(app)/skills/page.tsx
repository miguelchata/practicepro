'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MoreVertical, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSkills } from '@/firebase/firestore/use-collection';
import { useAddSkill, useUpdateSkill, useDeleteSkill } from '@/firebase/firestore/use-add-skill';
import { Skeleton } from '@/components/ui/skeleton';
import { iconMap } from '@/lib/icons';
import { EditSkillForm } from '@/components/skills/edit-skill-form';
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

export default function SkillsPage() {
  const { data: skills, loading } = useSkills();
  const addSkill = useAddSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const handleSkillAdded = async (
    newSkill: Omit<Skill, 'id' | 'totalHours' | 'userId' | 'subSkills'>
  ) => {
    await addSkill(newSkill);
    setIsAddDialogOpen(false);
  };
  
  const handleSkillUpdated = (updatedSkillData: Partial<Omit<Skill, 'id' | 'userId'>>) => {
    if (!editingSkill) return;
    updateSkill(editingSkill.id, updatedSkillData);
    setEditingSkill(null);
  };
  
  const handleDeleteSkill = (skillId: string) => {
    deleteSkill(skillId);
  }

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const categories = Object.keys(groupedSkills);
  
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                        return (
                          <Link key={skill.id} href={`/skills/${skill.id}`} className="flex group">
                            <Card className="flex w-full flex-col transition-all hover:shadow-md">
                              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                                  <div>
                                      <CardTitle className="font-headline group-hover:underline">
                                      {skill.name}
                                      </CardTitle>
                                  </div>
                                  <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => { e.preventDefault(); e.stopPropagation();}}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => { e.preventDefault(); e.stopPropagation();}}>
                                            <DropdownMenuItem asChild>
                                              <Link href={`/skills/${skill.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>View Details</span>
                                              </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setEditingSkill(skill)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action will permanently delete the <strong>{skill.name}</strong> skill and all associated data. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteSkill(skill.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                              </CardHeader>
                              <CardContent className="flex-grow">
                                  <div className="space-y-2">
                                  <p className="text-sm font-medium">
                                      Total Time: {skill.totalHours} hours
                                  </p>
                                  <Progress value={(skill.totalHours / 250) * 100} />
                                  <p className="text-sm font-medium pt-2">
                                      Active Goals: {allGoals(skill).length}
                                  </p>
                                  </div>
                              </CardContent>
                            </Card>
                          </Link>
                        )
                    })}
                    </div>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        )}

        {/* Edit Skill Dialog */}
        <Dialog open={!!editingSkill} onOpenChange={(open) => !open && setEditingSkill(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Skill</DialogTitle>
                    <DialogDescription>
                        Update the details for your skill.
                    </DialogDescription>
                </DialogHeader>
                {editingSkill && (
                    <EditSkillForm skill={editingSkill} onSkillUpdated={handleSkillUpdated} />
                )}
            </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
