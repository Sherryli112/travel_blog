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
const getPosts = async (ctx) => {
    const { topic, author, page = '1', pageSize = '10' } = ctx.query;
    const where = {};
    if (topic && Object.values(prisma_2.Topic).includes(topic)) {
        where.topic = topic;
    }
    if (author) {
        where.author = {
            name: {
                contains: author.toString(),
                mode: 'insensitive',
            }
        };
    }
    const skip = (parseInt(page.toString()) - 1) * parseInt(pageSize.toString());
    const [posts, total] = await Promise.all([
        prisma_1.default.post.findMany({
            where,
            include: {
                author: true,
            },
            skip,
            take: parseInt(pageSize.toString()),
            orderBy: { updatedAt: 'desc' },
        }),
        prisma_1.default.post.count({ where }),
    ]);
    ctx.body = {
        posts,
        total,
        page: parseInt(page.toString()),
        pageSize: parseInt(pageSize.toString()),
    };
};
exports.getPosts = getPosts;
async function getPostById(ctx) {
    const id = Number(ctx.params.id);
    const post = await prisma_1.default.post.findUnique({
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
async function createPost(ctx) {
    const { title, content, topic, authorName } = ctx.request.body;
    let author = await prisma_1.default.user.findUnique({ where: { name: authorName } });
    if (!author) {
        author = await prisma_1.default.user.create({ data: { name: authorName } });
    }
    const post = await prisma_1.default.post.create({
        data: { title, content, topic, authorId: author.id },
    });
    ctx.status = 201;
    ctx.body = post;
}
async function updatePost(ctx) {
    const id = Number(ctx.params.id);
    const { title, content, topic } = ctx.request.body;
    const post = await prisma_1.default.post.update({
        where: { id },
        data: { title, content, topic },
    });
    ctx.body = post;
}
async function deletePost(ctx) {
    const id = Number(ctx.params.id);
    await prisma_1.default.post.delete({ where: { id } });
    ctx.status = 204;
}
async function getCommentsByPost(ctx) {
    const postId = Number(ctx.params.id);
    const comments = await prisma_1.default.comment.findMany({
        where: { postId },
        include: { commenter: true },
        orderBy: { createdAt: 'desc' },
    });
    ctx.body = comments;
}
async function addCommentToPost(ctx) {
    const postId = Number(ctx.params.id);
    const post = await prisma_1.default.post.findUnique({ where: { id: postId } });
    if (!post) {
        ctx.status = 404;
        ctx.body = { message: '文章不存在，無法留言' };
        return;
    }
    const { content, commenterName } = ctx.request.body;
    let commenter = await prisma_1.default.user.findUnique({ where: { name: commenterName } });
    if (!commenter) {
        commenter = await prisma_1.default.user.create({ data: { name: commenterName } });
    }
    const comment = await prisma_1.default.comment.create({
        data: { content, postId, commenterId: commenter.id },
    });
    ctx.status = 201;
    ctx.body = comment;
}
//# sourceMappingURL=postController.js.map