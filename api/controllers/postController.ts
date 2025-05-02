import { Context } from 'koa';
import prisma from '../prisma';

// 取得文章列表
export async function getPosts(ctx: Context) {
  const { skip = 0, limit = 10, author, topic } = ctx.query;
  const where: any = {};
  if (author) where.author = { name: String(author) };
  if (topic) where.topic = String(topic);

  const posts = await prisma.post.findMany({
    where,
    skip: Number(skip),
    take: Number(limit),
    include: { author: true, comments: true },
    orderBy: { createdAt: 'desc' },
  });
  ctx.body = posts;
}

// 取得單篇文章
export async function getPostById(ctx: Context) {
  const id = Number(ctx.params.id);
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true, comments: { include: { commenter: true } } },
  });
  if (!post) {
    ctx.status = 404;
    ctx.body = { error: 'Post not found' };
    return;
  }
  ctx.body = post;
}

// 新增文章
export async function createPost(ctx: Context) {
  const { title, content, topic, authorName } = ctx.request.body;
  // 先找或建立作者
  let author = await prisma.author.findUnique({ where: { name: authorName } });
  if (!author) {
    author = await prisma.author.create({ data: { name: authorName } });
  }
  const post = await prisma.post.create({
    data: { title, content, topic, authorId: author.id },
  });
  ctx.status = 201;
  ctx.body = post;
}

// 編輯文章
export async function updatePost(ctx: Context) {
  const id = Number(ctx.params.id);
  const { title, content, topic } = ctx.request.body;
  const post = await prisma.post.update({
    where: { id },
    data: { title, content, topic },
  });
  ctx.body = post;
}

// 刪除文章
export async function deletePost(ctx: Context) {
  const id = Number(ctx.params.id);
  await prisma.post.delete({ where: { id } });
  ctx.status = 204;
}

// 取得文章留言
export async function getCommentsByPost(ctx: Context) {
  const postId = Number(ctx.params.id);
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { commenter: true },
    orderBy: { createdAt: 'asc' },
  });
  ctx.body = comments;
}

// 新增留言
export async function addCommentToPost(ctx: Context) {
  const postId = Number(ctx.params.id);
  const { content, commenterName } = ctx.request.body;
  // 先找或建立評論者
  let commenter = await prisma.commenter.findUnique({ where: { name: commenterName } });
  if (!commenter) {
    commenter = await prisma.commenter.create({ data: { name: commenterName } });
  }
  const comment = await prisma.comment.create({
    data: { content, postId, commenterId: commenter.id },
  });
  ctx.status = 201;
  ctx.body = comment;
}