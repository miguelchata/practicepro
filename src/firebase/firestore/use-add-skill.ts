
'use client';

import { addDoc, collection, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Skill } from '@/lib/types';

type NewSkillData = Omit<Skill, 'id' | 'totalHours' | 'userId' | 'subSkills'> & { subSkills?: string };

export function useAddSkill() {
  const firestore = useFirestore();
  const { data: user } = useUser();
  const { toast } = useToast();

  const addSkill = async (skillData: NewSkillData) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add a skill.',
      });
      return;
    }

    try {
      await addDoc(collection(firestore, 'skills'), {
        ...skillData,
        subSkills: skillData.subSkills ? skillData.subSkills.split('\n').filter(s => s.trim() !== '').map(s => ({ name: s, goals: [] })) : [],
        userId: user.uid,
        totalHours: 0,
      });

      toast({
        title: 'Skill Added!',
        description: `The "${skillData.name}" skill has been successfully added.`,
      });
    } catch (error: any) {
      console.error('Error adding skill:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem creating your skill.',
      });
    }
  };

  return addSkill;
}

export function useUpdateSkill() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const updateSkill = async (skillId: string, skillData: Partial<Skill>) => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Firestore not available.',
            });
            return;
        }

        try {
            const skillRef = doc(firestore, 'skills', skillId);
            await updateDoc(skillRef, skillData);

            toast({
                title: 'Skill Updated!',
                description: `The skill has been successfully updated.`,
            });
        } catch (error: any) {
            console.error('Error updating skill:', error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'There was a problem updating your skill.',
            });
        }
    };
    
    return updateSkill;
}

export function useDeleteSkill() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const deleteSkill = async (skillId: string) => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Firestore not available.',
            });
            return;
        }

        try {
            await deleteDoc(doc(firestore, 'skills', skillId));
            toast({
                title: 'Skill Deleted',
                description: 'The skill has been successfully deleted.',
            });
        } catch (error: any) {
            console.error('Error deleting skill:', error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'There was a problem deleting your skill.',
            });
        }
    };

    return deleteSkill;
}

