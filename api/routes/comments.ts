import Router from 'koa-router';
import * as commentController from '../controllers/commentController';

const router = new Router({ prefix: '/api/comments' });

router.delete('/:id', commentController.deleteComment);

export default router;