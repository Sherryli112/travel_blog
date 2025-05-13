import { Context } from 'koa';
import prisma from '../utils/prisma';
import { Prisma, Topic } from '../../generated/prisma';

// 取得文章列表
export const getPosts = async (ctx: Context) => {
  //從 query string 讀取分頁與過濾參數
  const {
    topic,
    author,
    page = '1',
    pageSize = '10'
  } = ctx.query;

  //初始為空(但會根據 schema.prisma 自動生成的型別，用來檢查查詢條件的正確結構)，根據參數逐步增加條件
  const where: Prisma.PostWhereInput = {};

  //如果 topic 存在，並且是 Topic enum 裡的有效值，就加進 where
  if (topic && Object.values(Topic).includes(topic as Topic)) {
    where.topic = topic as Topic;
  }

  //作者名稱(不分大小寫 + 模糊篩選)
  if (author) {
    where.author = {
      name: {
        contains: author.toString(),
        mode: 'insensitive', //不區分大小寫搜尋
      }
    };
  }

  //計算分頁
  const skip = (parseInt(page.toString()) - 1) * parseInt(pageSize.toString());

  //找出特定條件的文章資訊&數量
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: true,
      },
      skip,
      take: parseInt(pageSize.toString()),
      orderBy: { updatedAt: 'desc' }, //時間排序由新到舊
    }),
    prisma.post.count({ where }),
  ]);

  ctx.body = {
    posts,
    total,
    page: parseInt(page.toString()),
    pageSize: parseInt(pageSize.toString()),
  };
};




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
  let author = await prisma.user.findUnique({ where: { name: authorName } });
  if (!author) {
    author = await prisma.user.create({ data: { name: authorName } });
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
  let commenter = await prisma.user.findUnique({ where: { name: commenterName } });
  if (!commenter) {
    commenter = await prisma.user.create({ data: { name: commenterName } });
  }
  const comment = await prisma.comment.create({
    data: { content, postId, commenterId: commenter.id },
  });
  ctx.status = 201;
  ctx.body = comment;
}