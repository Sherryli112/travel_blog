import { Context } from 'koa';
import prisma from '../utils/prisma';


// 刪除留言（簡易驗證：確認名稱是否一致）
export async function deleteComment(ctx: Context) {
  const id = Number(ctx.params.id);
  const commenterName = ctx.query.commenterName as string;

  if (!commenterName) {
    ctx.status = 400;
    ctx.body = { error: 'Commenter name is required' };
    return;
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { commenter: true },
  });

  if (!comment) {
    ctx.status = 404;
    ctx.body = { error: 'Comment not found' };
    return;
  }

  if (!comment.commenter || comment.commenter.name !== commenterName) {
    ctx.status = 403;
    ctx.body = { error: 'Permission denied: Name does not match' };
    return;
  }

  await prisma.comment.delete({ where: { id } });
  ctx.status = 204; //成功刪除，但不回傳內容
}