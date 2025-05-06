import Router from 'koa-router';
import { getPosts, getPostById, createPost, updatePost, deletePost, getCommentsByPost, addCommentToPost } from '../controllers/postController';

const router = new Router({ prefix: '/api' });

// 文章相關路由
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.post('/posts', createPost);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

// 評論相關路由
router.get('/posts/:id/comments', getCommentsByPost);
router.post('/posts/:id/comments', addCommentToPost);

export default router; 