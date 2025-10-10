import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { skills } from '@/lib/data';
import { Timer } from 'lucide-react';

export default function PracticePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Practice Session" />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Start a New Session
            </CardTitle>
            <CardDescription>
              Set your intention and focus on your goal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="skill">Select Skill</Label>
              <Select>
                <SelectTrigger id="skill">
                  <SelectValue placeholder="Choose a skill to practice" />
                </SelectTrigger>
                <SelectContent>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      <div className="flex items-center gap-2">
                        <skill.icon className="h-4 w-4" />
                        <span>{skill.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Session Type</Label>
              <RadioGroup defaultValue="pomodoro" className="flex gap-4">
                <div>
                  <RadioGroupItem value="pomodoro" id="pomodoro" />
                  <Label htmlFor="pomodoro" className="ml-2">
                    Pomodoro (25/5 min)
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="timed" id="timed" />
                  <Label htmlFor="timed" className="ml-2">
                    Custom Timer
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual" className="ml-2">
                    Manual Log
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="intention">Intention for this session</Label>
              <Input
                id="intention"
                placeholder='e.g., "Practice smooth transitions between G and C chords"'
              />
            </div>
            <Button size="lg" className="w-full">
              <Timer className="mr-2 h-5 w-5" /> Start Session
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
