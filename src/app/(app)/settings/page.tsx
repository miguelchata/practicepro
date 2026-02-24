// This file is neutralized to avoid route group collisions with src/app/settings/page.tsx
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/settings');
}
