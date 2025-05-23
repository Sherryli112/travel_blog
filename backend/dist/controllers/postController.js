"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPosts = void 0;
exports.getPostById = getPostById;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.getCommentsByPost = getCommentsByPost;
exports.addCommentToPost = addCommentToPost;
const prisma_1 = __importDefault(require("../utils/prisma"));
const prisma_2 = require("../../generated/prisma");
const response_1 = require("../utils/response");
const getPosts = async (ctx) => {
    const { topic, author, page = '1', pageSize = '10' } = ctx.query;
    const pageNum = parseInt(page.toString());
    const sizeNum = parseInt(pageSize.toString());
    if (isNaN(pageNum) || pageNum < 1 || isNaN(sizeNum) || sizeNum < 1) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('page 與 pageSize 需為大於 0 的整數');
        return;
    }
    if (topic && !Object.values(prisma_2.Topic).includes(topic)) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('topic 格式錯誤，請確認是否為有效值');
        return;
    }
    const where = {};
    if (topic)
        where.topic = topic;
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
        prisma_1.default.post.findMany({
            where,
            include: { author: true },
            skip,
            take: sizeNum,
            orderBy: { updatedAt: 'desc' },
        }),
        prisma_1.default.post.count({ where }),
    ]);
    ctx.body = (0, response_1.successResponse)({
        posts,
        total,
        page: pageNum,
        pageSize: sizeNum,
    }, '取得文章列表成功');
};
exports.getPosts = getPosts;
async function getPostById(ctx) {
    const id = Number(ctx.params.id);
    if (isNaN(id)) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('文章 ID 必須是數字');
        return;
    }
    const post = await prisma_1.default.post.findUnique({
        where: { id },
        include: { author: true, comments: { include: { commenter: true } } },
    });
    if (!post) {
        ctx.status = 404;
        ctx.body = (0, response_1.errorResponse)('找不到該文章');
        return;
    }
    ctx.body = (0, response_1.successResponse)(post, '取得文章成功');
}
async function createPost(ctx) {
    const { title, content, topic, authorName } = ctx.request.body;
    if (!title || !content || !topic || !authorName) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('缺少必要欄位');
        return;
    }
    let author = await prisma_1.default.user.findUnique({ where: { name: authorName } });
    if (!author) {
        author = await prisma_1.default.user.create({ data: { name: authorName } });
    }
    const post = await prisma_1.default.post.create({
        data: { title, content, topic, authorId: author.id },
    });
    ctx.status = 201;
    ctx.body = (0, response_1.successResponse)(post, '文章發布成功');
}
async function updatePost(ctx) {
    const id = Number(ctx.params.id);
    const { title, content, topic, authorName } = ctx.request.body;
    if (isNaN(id) || !title || !content || !topic || !authorName) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('缺少必要欄位或無效 ID');
        return;
    }
    const existingPost = await prisma_1.default.post.findUnique({
        where: { id },
        include: { author: true },
    });
    if (!existingPost || existingPost.author.name !== authorName) {
        ctx.status = 403;
        ctx.body = (0, response_1.errorResponse)('作者名稱不符，無法編輯文章');
        return;
    }
    const post = await prisma_1.default.post.update({
        where: { id },
        data: { title, content, topic },
    });
    ctx.body = (0, response_1.successResponse)(post, '更新文章成功');
}
async function deletePost(ctx) {
    const id = Number(ctx.params.id);
    const { authorName } = ctx.request.body;
    if (isNaN(id)) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('文章 ID 必須是數字');
        return;
    }
    if (!authorName) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('缺少作者名稱');
        return;
    }
    const post = await prisma_1.default.post.findUnique({
        where: { id },
        include: { author: true },
    });
    if (!post) {
        ctx.status = 404;
        ctx.body = (0, response_1.errorResponse)('找不到該文章');
        return;
    }
    if (!post.author || post.author.name !== authorName) {
        ctx.status = 403;
        ctx.body = (0, response_1.errorResponse)('作者名稱不符，無法刪除文章');
        return;
    }
    await prisma_1.default.post.delete({ where: { id } });
    ctx.body = (0, response_1.successResponse)({ id }, '文章已成功刪除');
}
async function getCommentsByPost(ctx) {
    const postId = Number(ctx.params.id);
    if (isNaN(postId)) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('文章 ID 必須是數字');
        return;
    }
    const comments = await prisma_1.default.comment.findMany({
        where: { postId },
        include: { commenter: true },
        orderBy: { createdAt: 'desc' },
    });
    ctx.body = (0, response_1.successResponse)(comments, '取得留言成功');
}
async function addCommentToPost(ctx) {
    const postId = Number(ctx.params.id);
    const { content, commenterName } = ctx.request.body;
    if (isNaN(postId) || !content || !commenterName) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('缺少必要欄位或無效 ID');
        return;
    }
    const post = await prisma_1.default.post.findUnique({ where: { id: postId } });
    if (!post) {
        ctx.status = 404;
        ctx.body = { message: '文章不存在，無法留言' };
        return;
    }
    let commenter = await prisma_1.default.user.findUnique({ where: { name: commenterName } });
    if (!commenter) {
        commenter = await prisma_1.default.user.create({ data: { name: commenterName } });
    }
    const comment = await prisma_1.default.comment.create({
        data: { content, postId, commenterId: commenter.id },
    });
    ctx.status = 201;
    ctx.body = (0, response_1.successResponse)(comment, '新增留言成功');
}
//# sourceMappingURL=postController.js.map