import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import router from './routes';

const app = new Koa();

// 使用中間件
app.use(cors({
  origin: 'http://localhost:3000', // 前端服務的地址
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], // 允許的 HTTP 方法
  allowHeaders: ['Content-Type', 'Authorization'], // 允許的 HTTP 標頭
  credentials: true // 是否允許攜帶 cookies 或授權資訊
}));

//接收 ctx.request.body 取得 POST、PUT 請求中送來的資料
app.use(bodyParser()); 
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 