<<<<<<< HEAD
=======
<<<<<<<< HEAD:src/app/(app)/layout.tsx
// This file is neutralized to avoid route group collisions.
// Functional layout logic has moved to src/components/layout/authenticated-layout.tsx.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
========
>>>>>>> origin/main
'use client';

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

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader>
          <Link
            href="/dashboard"
<<<<<<< HEAD
            className="flex items-center gap-2 text-sidebar-foreground px-4 py-4"
=======
            className="flex items-center gap-2 text-sidebar-foreground"
>>>>>>> origin/main
          >
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline tracking-tighter">
              Lexio
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
<<<<<<< HEAD
=======
>>>>>>>> origin/main:src/components/layout/authenticated-layout.tsx
>>>>>>> origin/main
}
