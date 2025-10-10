import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { aiTasks } from '@/lib/data';
import { Bot, Check, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export function AiTasks() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span>AI-Generated Tasks</span>
            </CardTitle>
            <CardDescription>
              Custom tasks based on your goals and recent sessions.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Generate New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {aiTasks.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <Checkbox id={`task-${index}`} />
              <label
                htmlFor={`task-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item.task}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
