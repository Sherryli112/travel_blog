import dotenv from 'dotenv';
import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import { errorHandler } from './middleware/errorHandler';
import router from './routes';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const app = new Koa();

// 允許的前端來源，可以用環境變數設定
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:4000'
];

// 接收 ctx.request.body 取得 POST、PUT 請求中送來的資料
app.use(bodyParser());

// 設定 cors 中間件
app.use(cors({
  origin: (ctx) => {
    // ctx.request.header.origin 可能是 undefined，先用 ? 安全存取
    const requestOrigin = ctx.request.header.origin ?? '';

    if (allowedOrigins.includes(requestOrigin)) {
      return requestOrigin;  // 允許的 origin 回傳給瀏覽器
    }
    return ''; // 不允許其他 origin，或可以回傳 undefined 或 null
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], // 允許的 HTTP 方法
  allowHeaders: ['Content-Type', 'Authorization'], // 允許的 HTTP 標頭
  credentials: true, // 是否允許攜帶 cookies 或授權資訊
}));


//由中介一併處理錯誤
app.use(errorHandler);

// 使用路由
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
