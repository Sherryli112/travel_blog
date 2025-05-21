"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = deleteComment;
const prisma_1 = __importDefault(require("../utils/prisma"));
const response_1 = require("../utils/response");
async function deleteComment(ctx) {
    const id = Number(ctx.params.id);
    const commenterName = ctx.query.commenterName;
    if (isNaN(id)) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('ID 必須是數字');
        return;
    }
    if (!commenterName) {
        ctx.status = 400;
        ctx.body = (0, response_1.errorResponse)('缺少留言者名稱');
        return;
    }
    const comment = await prisma_1.default.comment.findUnique({
        where: { id },
        include: { commenter: true },
    });
    if (!comment) {
        ctx.status = 404;
        ctx.body = (0, response_1.errorResponse)('找不到該留言');
        return;
    }
    if (!comment.commenter || comment.commenter.name !== commenterName) {
        ctx.status = 403;
        ctx.body = (0, response_1.errorResponse)('留言者名稱不符，無法刪除留言');
        return;
    }
    await prisma_1.default.comment.delete({ where: { id } });
    ctx.body = (0, response_1.successResponse)({ id }, '留言已刪除');
}
//# sourceMappingURL=commentController.js.map