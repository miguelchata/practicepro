import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { Achievements } from '@/components/dashboard/achievements';
import { AiTasks } from '@/components/dashboard/ai-tasks';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <StatsCards />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ProgressChart />
          </div>
          <div>
            <Achievements />
          </div>
        </div>
        <AiTasks />
      </main>
    </div>
  );
}
