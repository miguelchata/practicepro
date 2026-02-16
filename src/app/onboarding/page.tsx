'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';

export default function OnboardingPage() {
  const router = useRouter();

  const handleOnboardingSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-2 text-foreground">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-headline tracking-tighter">
                Lexio
              </span>
            </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              Welcome to Lexio!
            </CardTitle>
            <CardDescription>
              Let's set up your profile. Tell us about your current level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleOnboardingSubmit}
              className="flex flex-col gap-6"
            >
              <div className="space-y-2">
                <Label htmlFor="proficiency">
                  What is your current English proficiency level?
                </Label>
                <Select name="proficiency" defaultValue="Beginner" required>
                  <SelectTrigger id="proficiency">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 flex justify-end">
                <Button type="submit" size="lg">
                  Start Practicing
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
