import { Context } from 'koa';
import prisma from '../utils/prisma';
import { Prisma, Topic } from '../../generated/prisma';
import { successResponse, errorResponse } from '../utils/response';

// 取得文章列表
export const getPosts = async (ctx: Context) => {
  const { topic, author, page = '1', pageSize = '10' } = ctx.query;
  const pageNum = parseInt(page.toString());
  const sizeNum = parseInt(pageSize.toString());
  if (isNaN(pageNum) || pageNum < 1 || isNaN(sizeNum) || sizeNum < 1) {
    ctx.status = 400;
    ctx.body = errorResponse('page 與 pageSize 需為大於 0 的整數');
    return;
  }
  if (topic && !Object.values(Topic).includes(topic as Topic)) {
    ctx.status = 400;
    ctx.body = errorResponse('topic 格式錯誤，請確認是否為有效值');
    return;
  }
  //根據 Prisma 中的 Post 模型生成的查詢條件型別
  const where: Prisma.PostWhereInput = {};
  if (topic) where.topic = topic as Topic;
  if (author) {
    where.author = {
      name: {
        contains: author.toString(),
        mode: 'insensitive',
      },
    };
  }
  const skip = (pageNum - 1) * sizeNum;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { author: true },
      skip,
      take: sizeNum,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.post.count({ where }),
  ]);
  ctx.body = successResponse({
    posts,
    total,
    page: pageNum,
    pageSize: sizeNum,
  }, '取得文章列表成功');
};


// 取得單篇文章
export async function getPostById(ctx: Context) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.status = 400;
    ctx.body = errorResponse('文章 ID 必須是數字');
    return;
  }
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true, comments: { include: { commenter: true } } },
  });
  if (!post) {
    ctx.status = 404;
    ctx.body = errorResponse('找不到該文章');
    return;
  }

  ctx.body = successResponse(post, '取得文章成功');
}

type CreatePostBody = {
  title: string;
  content: string;
  topic: Topic;
  authorName: string;
};

// 新增文章
export async function createPost(ctx: Context) {
  const { title, content, topic, authorName } = ctx.request.body as CreatePostBody;
  if (!title || !content || !topic || !authorName) {
    ctx.status = 400;
    ctx.body = errorResponse('缺少必要欄位');
    return;
  }
  if (title.length < 5) {
    ctx.status = 400;
    ctx.body = errorResponse('標題至少需要5個字');
    return;
  }
  const contentText = content.replace(/<[^>]*>/g, '').trim();
  if (contentText.length < 20) {
    ctx.status = 400;
    ctx.body = errorResponse('內容至少需要20個字');
    return;
  }
  if (!Object.values(Topic).includes(topic)) {
    ctx.status = 400;
    ctx.body = errorResponse('無效的文章主題');
    return;
  }
  if (authorName.length < 2) {
    ctx.status = 400;
    ctx.body = errorResponse('作者名稱至少需要2個字');
    return;
  }
  // 查詢資料庫是否有作者名稱，沒有的話就建立
  let author = await prisma.user.findUnique({ where: { name: authorName } });
  if (!author) {
    author = await prisma.user.create({ data: { name: authorName } });
  }

  const post = await prisma.post.create({
    data: { title, content, topic, authorId: author.id },
  });

  ctx.status = 201;
  ctx.body = successResponse(post, '文章發布成功');
}

type UpdatePostBody = {
  title?: string;
  content?: string;
  topic?: Topic;
  authorName: string;
};

// 編輯文章
export async function updatePost(ctx: Context) {
  const id = Number(ctx.params.id);
  const { title, content, topic, authorName } = ctx.request.body as UpdatePostBody;
  if (isNaN(id) || !title || !content || !topic || !authorName) {
    ctx.status = 400;
    ctx.body = errorResponse('缺少必要欄位或無效 ID');
    return;
  }
  if (title.length < 5) {
    ctx.status = 400;
    ctx.body = errorResponse('標題至少需要5個字');
    return;
  }
  const contentText = content.replace(/<[^>]*>/g, '').trim();
  if (contentText.length < 20) {
    ctx.status = 400;
    ctx.body = errorResponse('內容至少需要20個字');
    return;
  }
  if (!Object.values(Topic).includes(topic)) {
    ctx.status = 400;
    ctx.body = errorResponse('無效的文章主題');
    return;
  }
  if (authorName.length < 2) {
    ctx.status = 400;
    ctx.body = errorResponse('作者名稱至少需要2個字');
    return;
  }

  // 檢查文章是否存在且作者是否相符
  const existingPost = await prisma.post.findUnique({
    where: { id },
    include: { author: true },
  });
  if (!existingPost || existingPost.author.name !== authorName) {
    ctx.status = 403;
    ctx.body = errorResponse('作者名稱不符，無法編輯文章');
    return;
  }

  const post = await prisma.post.update({
    where: { id },
    data: { title, content, topic },
  });
  ctx.body = successResponse(post, '更新文章成功');
}

// 刪除文章
export async function deletePost(ctx: Context) {
  const id = Number(ctx.params.id);
  const { authorName } = ctx.request.body as { authorName?: string };
  if (isNaN(id)) {
    ctx.status = 400;
    ctx.body = errorResponse('文章 ID 必須是數字');
    return;
  }
  if (!authorName) {
    ctx.status = 400;
    ctx.body = errorResponse('缺少作者名稱');
    return;
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true },
  });
  if (!post) {
    ctx.status = 404;
    ctx.body = errorResponse('找不到該文章');
    return;
  }
  if (!post.author || post.author.name !== authorName) {
    ctx.status = 403;
    ctx.body = errorResponse('作者名稱不符，無法刪除文章');
    return;
  }
  await prisma.post.delete({ where: { id } });
  ctx.body = successResponse({ id }, '文章已成功刪除');
}

// 取得文章留言
export async function getCommentsByPost(ctx: Context) {
  const postId = Number(ctx.params.id);
  if (isNaN(postId)) {
    ctx.status = 400;
    ctx.body = errorResponse('文章 ID 必須是數字');
    return;
  }
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { commenter: true },
    orderBy: { createdAt: 'desc' },
  });
  ctx.body = successResponse(comments, '取得留言成功');
}

type CreateCommentBody = {
  content: string;
  commenterName: string;
};

// 新增留言
export async function addCommentToPost(ctx: Context) {
  const postId = Number(ctx.params.id);
  const { content, commenterName } = ctx.request.body as CreateCommentBody;
  if (isNaN(postId) || !content || !commenterName) {
    ctx.status = 400;
    ctx.body = errorResponse('缺少必要欄位或無效 ID');
    return;
  }
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    ctx.status = 404;
    ctx.body = { message: '文章不存在，無法留言' };
    return;
  }

  // 先找或建立評論者
  let commenter = await prisma.user.findUnique({ where: { name: commenterName } });
  if (!commenter) {
    commenter = await prisma.user.create({ data: { name: commenterName } });
  }
  const comment = await prisma.comment.create({
    data: { content, postId, commenterId: commenter.id },
  });
  ctx.status = 201;
  ctx.body = successResponse(comment, '新增留言成功');
}