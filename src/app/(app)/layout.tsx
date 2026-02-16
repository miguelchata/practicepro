import type { Header } from '@/components/layout/header';
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { SidebarNav } from '@/components/layout/sidebar-nav';

export default function AppLayout({ children }: { children: ReactNode }) {
  // Mock check for sidebar state, in a real app this would come from a cookie or user settings
  const isSidebarOpen = true; 

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <Sidebar>
        <SidebarHeader>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sidebar-foreground"
          >
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline tracking-tighter">
              Refered English practice
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
