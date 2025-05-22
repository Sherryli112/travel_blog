import Router from 'koa-router';
import * as commentController from '../controllers/commentController';

//用 prefix 加上路由前綴 /api/comments
const router = new Router({ prefix: '/api/comments' });

//刪除留言
router.post('/:id/delete', commentController.deleteComment);

export default router;