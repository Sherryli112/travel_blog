import { Context } from 'koa';
import prisma from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';

// 刪除留言（簡易驗證：確認名稱是否一致）
export async function deleteComment(ctx: Context) {
  const id = Number(ctx.params.id);
  const { commenterName } = ctx.request.body as { commenterName?: string };

  if (isNaN(id)) {
    ctx.status = 400;
    ctx.body = errorResponse('ID 必須是數字');
    return;
  }

  if (!commenterName) {
    ctx.status = 400;
    ctx.body = errorResponse('缺少留言者名稱');
    return;
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { commenter: true },
  });

  if (!comment) {
    ctx.status = 404;
    ctx.body = errorResponse('找不到該留言');
    return;
  }

  if (!comment.commenter || comment.commenter.name !== commenterName) {
    ctx.status = 403;
    ctx.body = errorResponse('留言者名稱不符，無法刪除留言');
    return;
  }

  await prisma.comment.delete({ where: { id } });
  ctx.body = successResponse({ id }, '留言已成功刪除');
}