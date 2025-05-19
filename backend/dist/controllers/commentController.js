"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = deleteComment;
const prisma_1 = __importDefault(require("../utils/prisma"));
async function deleteComment(ctx) {
    const id = Number(ctx.params.id);
    const commenterName = ctx.query.commenterName;
    if (!commenterName) {
        ctx.status = 400;
        ctx.body = { error: 'Commenter name is required' };
        return;
    }
    const comment = await prisma_1.default.comment.findUnique({
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
    await prisma_1.default.comment.delete({ where: { id } });
    ctx.status = 204;
}
//# sourceMappingURL=commentController.js.map