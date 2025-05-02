import Router from 'koa-router';
import * as postController from '../controllers/postController';

const router = new Router({ prefix: '/api/posts' });

router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);
router.post('/', postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

router.get('/:id/comments', postController.getCommentsByPost);
router.post('/:id/comments', postController.addCommentToPost);

export default router;