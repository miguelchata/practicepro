'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Download, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { data: user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (auth?.currentUser && name !== auth.currentUser.displayName) {
      try {
        await updateProfile(auth.currentUser, { displayName: name });
        toast({
          title: 'Success!',
          description: 'Your profile has been updated.',
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error updating profile',
          description: error.message,
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Settings" />
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Account Information</CardTitle>
            <CardDescription>
              Update your personal details here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!user}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled // Email is not typically changed here
                />
              </div>
            </div>
            <Button onClick={handleSaveChanges} disabled={!user}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Notifications</CardTitle>
            <CardDescription>
              Manage your notification preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <h4 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Practice Reminders
                </h4>
                <p className="text-sm text-muted-foreground">
                  Get notified when it&apos;s time to practice.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <h4 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" /> AI Insight Alerts
                </h4>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when new AI insights are ready.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Data Export</CardTitle>
            <CardDescription>
              Export your session logs and progress data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Download your data as a CSV file for your records or to share
              with a coach.
            </p>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}