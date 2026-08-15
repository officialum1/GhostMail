'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getAdminFromToken } from '@/lib/adminSession';
import { logAudit } from '@/lib/audit';

/**
 * Server actions are reachable as POST endpoints by anyone who knows the action
 * id, so the admin check has to live here rather than in the calling page.
 */
export async function deleteUser(formData: FormData) {
  const admin = await getAdminFromToken();
  if (!admin) throw new Error('Unauthorized');

  const raw = formData.get('id');
  if (!raw) return;

  const id = Number.parseInt(raw.toString(), 10);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid user id');

  try {
    const user = await db.user.delete({
      where: { id },
      select: { username: true, email: true },
    });

    await logAudit(
      admin.adminId,
      'user_delete',
      user.username,
      `Deleted user ${user.username} (${user.email})`
    );

    revalidatePath('/admin/users');
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw new Error('Failed to delete user');
  }
}
