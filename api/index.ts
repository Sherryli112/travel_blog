import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import postRoutes from './routes/posts';
import commentRoutes from './routes/comments';

const app = new Koa();

//允許跨域
app.use(cors());

//解析 JSON / URL-encoded 請求主體
app.use(bodyParser());

//掛載文章路由
app.use(postRoutes.routes());

//掛載文章路由的允許方法
app.use(postRoutes.allowedMethods());

//掛載留言路由
app.use(commentRoutes.routes());

//掛載留言路由的允許方法
app.use(commentRoutes.allowedMethods());

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});