'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { useSkills } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Timer, Target, Puzzle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Goal, Skill, GoalLevel } from '@/lib/types';
import Link from 'next/link';

type GoalWithSkillInfo = Goal & {
  skillId: string;
  skillName: string;
  subSkillName: string;
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

export default function PracticePage() {
  const router = useRouter();
  const { data: skills, loading: skillsLoading } = useSkills();

  const allGoals: GoalWithSkillInfo[] = useMemo(() => {
    if (skillsLoading) {
      return [];
    }
    return skills.flatMap(skill =>
      skill.subSkills.flatMap(subSkill =>
        subSkill.goals.map(goal => ({
          ...goal,
          skillId: skill.id,
          skillName: skill.name,
          subSkillName: subSkill.name,
        }))
      )
    );
  }, [skills, skillsLoading]);

  const practiceUrl = (goal: GoalWithSkillInfo) => {
    const params = new URLSearchParams();
    params.set('skillId', goal.skillId);
    params.set('skillName', goal.skillName);
    if (goal.subSkillName) {
        params.set('subSkill', goal.subSkillName);
    }
    if (goal.specific) {
        params.set('goal', goal.specific);
    }
    if (goal.duration) {
        params.set('type', 'timed');
        params.set('duration', String(goal.duration * 60));
    }
    return `/practice/active?${params.toString()}`;
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Start Practice Session" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">
              Choose a Goal
            </h2>
            <p className="text-muted-foreground">
              Select one of your goals to start a focused practice session.
            </p>
          </div>
        </div>

        {skillsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
        ) : allGoals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allGoals.map((goal, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-medium text-base">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                         <Badge variant="secondary" className="gap-1.5"><Target className="h-3 w-3"/>{goal.skillName}</Badge>
                         <Badge variant="outline" className="gap-1.5"><Puzzle className="h-3 w-3"/>{goal.subSkillName}</Badge>
                         {goal.level && <Badge variant={getLevelVariant(goal.level)}>{goal.level}</Badge>}
                    </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={practiceUrl(goal)}>
                      <Timer className="mr-2 h-4 w-4" />
                      Practice
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardHeader>
              <CardTitle>No Goals Found</CardTitle>
              <CardDescription>
                You haven't set any goals for your skills yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/skills">Go to Skills to Add Goals</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
