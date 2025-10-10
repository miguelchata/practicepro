'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { progressChartData } from '@/lib/data';
import type { ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  hours: {
    label: 'Hours',
  },
  guitar: {
    label: 'Guitar',
    color: 'hsl(var(--primary))',
  },
  speaking: {
    label: 'Public Speaking',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export function ProgressChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Monthly Practice</CardTitle>
        <CardDescription>
          Total hours practiced per skill over the last 6 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={progressChartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="Guitar"
              name="Guitar"
              fill="var(--color-guitar)"
              radius={4}
            />
            <Bar
              dataKey="Speaking"
              name="Public Speaking"
              fill="var(--color-speaking)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
