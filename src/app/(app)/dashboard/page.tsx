import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { Achievements } from '@/components/dashboard/achievements';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <StatsCards />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <div>
            <Achievements />
          </div>
          <div className="flex flex-col justify-center items-center p-8 bg-muted/30 rounded-lg border border-dashed">
            <h3 className="text-xl font-headline font-semibold mb-2">Welcome to Refered English practice</h3>
            <p className="text-muted-foreground text-center">
              Your personalized journey to mastery. Use the sidebar to explore your English vocabulary and track your daily streak.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
