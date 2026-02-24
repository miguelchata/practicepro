// This file is neutralized to avoid route group collisions with src/app/practice/page.tsx
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/practice');
}
