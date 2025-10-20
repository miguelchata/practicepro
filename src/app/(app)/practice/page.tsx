'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import type { Skill } from '@/lib/types';
import { Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PracticePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedSkill, setSelectedSkill] = useState<Skill | undefined>(undefined);
  const [sessionType, setSessionType] = useState('pomodoro');
  const [intention, setIntention] = useState('');
  const [customTime, setCustomTime] = useState(10); // Default to 10 minutes
  const [selectedSubSkill, setSelectedSubSkill] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');


  const handleSkillChange = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    setSelectedSkill(skill);
    // Reset sub-skill and goal selection when skill changes
    setSelectedSubSkill('');
    setSelectedGoal('');
  };

  const handleStartSession = () => {
    if (!selectedSkill) {
      toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: 'Please select a skill before starting a session.',
      });
      return;
    }

    const queryParams = new URLSearchParams({
      skillId: selectedSkill.id,
      skillName: selectedSkill.name,
      type: sessionType,
      intention: intention,
    });

    if (sessionType === 'timed') {
        queryParams.set('duration', String(customTime * 60));
    }
    
    if (selectedSubSkill) {
        queryParams.set('subSkill', selectedSubSkill);
    }

    if (selectedGoal) {
        queryParams.set('goal', selectedGoal);
    }


    router.push(`/practice/active?${queryParams.toString()}`);
  };
  
  const availableGoals = selectedSubSkill
    ? selectedSkill?.subSkills.find(s => s.name === selectedSubSkill)?.goals
    : [];

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
              <Select onValueChange={handleSkillChange} value={selectedSkill?.id}>
                <SelectTrigger id="skill">
                  <SelectValue placeholder="Choose a skill to practice" />
                </SelectTrigger>
                <SelectContent>
                  {skills.map(skill => (
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

            {selectedSkill && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="sub-skill">Focus on Sub-skill (optional)</Label>
                        <Select onValueChange={setSelectedSubSkill} value={selectedSubSkill} disabled={!selectedSkill.subSkills || selectedSkill.subSkills.length === 0}>
                            <SelectTrigger id="sub-skill">
                                <SelectValue placeholder="Select a sub-skill" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedSkill.subSkills.map((subSkill) => (
                                    <SelectItem key={subSkill.name} value={subSkill.name}>
                                        {subSkill.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="goal">Link to Goal (optional)</Label>
                        <Select onValueChange={setSelectedGoal} value={selectedGoal} disabled={!availableGoals || availableGoals.length === 0}>
                            <SelectTrigger id="goal">
                                <SelectValue placeholder="Select a goal" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableGoals?.map((goal, index) => (
                                    <SelectItem key={index} value={goal.description}>
                                        {goal.description}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}


            <div className="space-y-2">
              <Label>Session Type</Label>
              <RadioGroup
                value={sessionType}
                onValueChange={setSessionType}
                className="grid grid-cols-2 gap-4 md:grid-cols-3"
              >
                <div>
                  <RadioGroupItem value="pomodoro" id="pomodoro" className="peer sr-only" />
                  <Label htmlFor="pomodoro" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Pomodoro <span className="text-xs text-muted-foreground">(25 min)</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="timed" id="timed" className="peer sr-only" />
                  <Label htmlFor="timed" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Custom Timer
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="manual" id="manual" className="peer sr-only" />
                  <Label htmlFor="manual" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Manual Log
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {sessionType === 'timed' && (
                <div className="space-y-2">
                    <Label htmlFor="custom-time">Custom Duration (minutes)</Label>
                    <Input
                    id="custom-time"
                    type="number"
                    value={customTime}
                    onChange={(e) => setCustomTime(Number(e.target.value))}
                    min="1"
                    />
                </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="intention">Intention for this session</Label>
              <Input
                id="intention"
                placeholder='e.g., "Practice smooth transitions between G and C chords"'
                value={intention}
                onChange={e => setIntention(e.target.value)}
              />
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleStartSession}
            >
              <Timer className="mr-2 h-5 w-5" /> Start Session
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
