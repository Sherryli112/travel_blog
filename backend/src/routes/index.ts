import Router from 'koa-router';
import postsRouter from './posts';
import commentsRouter from './comments';

const router = new Router();

router.use(postsRouter.routes());
router.use(commentsRouter.routes());

export default router; 