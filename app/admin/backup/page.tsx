import { requireAdminRoleOrRedirect } from '@/lib/adminAuth';
import BackupClient from '@/components/admin/BackupClient';

export const metadata = { title: 'Backup' };

export default function BackupPage() {
  requireAdminRoleOrRedirect();
  return <BackupClient />;
}
