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
import { skills } from '@/lib/data';
import { PlusCircle } from 'lucide-react';

export default function SkillsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Skills & Goals" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">Your Skills</h2>
            <p className="text-muted-foreground">
              Manage your skills and track your goals.
            </p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <skill.icon className="h-10 w-10 text-primary" />
                <div>
                  <CardTitle className="font-headline">{skill.name}</CardTitle>
                  <CardDescription>{skill.proficiency}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total Time: {skill.totalHours} hours</p>
                  <Progress value={(skill.totalHours / 250) * 100} />
                  <p className="text-sm font-medium pt-2">Active Goals:</p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {skill.goals.map((goal) => (
                      <li key={goal}>{goal}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
