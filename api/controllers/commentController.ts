import { Context } from 'koa';
import prisma from '../prisma';

// 刪除留言（可加驗證）
export async function deleteComment(ctx: Context) {
  const id = Number(ctx.params.id);
  // 這裡可加驗證邏輯
  await prisma.comment.delete({ where: { id } });
  ctx.status = 204;
}