'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Book,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Target,
  Timer,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/skills', label: 'Skills', icon: Target },
  { href: '/practice', label: 'Practice', icon: Timer },
  { href: '/journal', label: 'Journal', icon: Book },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Make 'Projects' active for sub-paths as well.
    if (href.startsWith('/projects')) {
      return pathname.startsWith(href);
    }
     // Make 'Skills' active for sub-paths as well.
    if (href.startsWith('/skills')) {
      return pathname.startsWith(href);
    }
    return pathname === href;
  };

  return (
    <>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive(item.href)}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarMenu className="mt-auto">
        {bottomNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive(item.href)}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
}
