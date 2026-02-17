import { redirect } from 'next/navigation';

export default function DeprecatedManagementPage() {
  redirect('/management');
}
