import Router from 'koa-router';
import * as postController from '../controllers/postController';

//用 prefix 加上路由前綴 /api/posts
const router = new Router({ prefix: '/api/posts' });

//取得文章列表
router.get('/', postController.getPosts);

//取得單篇文章
router.get('/:id', postController.getPostById);

//新增文章
router.post('/', postController.createPost);

//編輯文章
router.put('/:id', postController.updatePost);

//刪除文章
router.delete('/:id', postController.deletePost);

//取得文章留言
router.get('/:id/comments', postController.getCommentsByPost);

//新增留言
router.post('/:id/comments', postController.addCommentToPost);


export default router;