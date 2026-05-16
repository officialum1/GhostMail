'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteUser(formData: FormData) {
  const id = formData.get('id');
  if (!id) return;

  try {
    await db.user.delete({
      where: { id: parseInt(id.toString()) }
    });
    revalidatePath('/admin/users');
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw new Error('Failed to delete user');
  }
}
