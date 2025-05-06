import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import router from './routes';

const app = new Koa();

// 使用中間件
app.use(cors({
  origin: 'http://localhost:3000', // 前端服務的地址
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 