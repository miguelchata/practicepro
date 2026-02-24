// This file is neutralized to avoid route group collisions with src/app/management/page.tsx
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/management');
}
