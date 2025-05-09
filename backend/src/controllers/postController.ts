import { Context } from 'koa';
import prisma from '../utils/prisma';
import { Topic } from '../../generated/prisma';

// 取得文章列表
export async function getPosts(ctx: Context) {
  // 從 query string 讀取分頁與過濾參數
  const { skip = 0, author, topic } = ctx.query;
  // 根據是否有傳參數來建立查詢條件
  const where: any = {};
  if (author) where.author = { name: String(author) };
  if (topic) where.topic = String(topic);

  const posts = await prisma.post.findMany({
    where,  //條件過濾
    skip: Number(skip),  //跳過前幾筆(用於分頁)
    // take: 10,  //取出幾筆資料
    include: { author: true, comments: true },  //包含作者與留言
    orderBy: { createdAt: 'desc' },  //時間排序由新到舊
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

type CreatePostBody = {
  title: string;
  content: string;
  topic: Topic;
  authorName: string;
};

// 新增文章
export async function createPost(ctx: Context) {
  const { title, content, topic, authorName } = ctx.request.body as CreatePostBody;
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

type UpdatePostBody = {
  title?: string;
  content?: string;
  topic?: Topic;
};

// 編輯文章
export async function updatePost(ctx: Context) {
  const id = Number(ctx.params.id);
  const { title, content, topic } = ctx.request.body as UpdatePostBody;
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

type CreateCommentBody = {
  content: string;
  commenterName: string;
};

// 新增留言
export async function addCommentToPost(ctx: Context) {
  const postId = Number(ctx.params.id);
  const { content, commenterName } = ctx.request.body as CreateCommentBody;
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