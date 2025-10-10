import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { achievements } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Achievements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          Milestones & Achievements
        </CardTitle>
        <CardDescription>
          Celebrate your progress and dedication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {achievements.map((achievement) => (
            <li
              key={achievement.name}
              className={cn(
                'flex items-center gap-4 transition-opacity',
                !achievement.unlocked && 'opacity-40'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg bg-muted',
                  achievement.unlocked && 'bg-accent/20 text-accent'
                )}
              >
                <Trophy className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{achievement.name}</p>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
              {achievement.unlocked && (
                <Badge variant="secondary">Unlocked</Badge>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
