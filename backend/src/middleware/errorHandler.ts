import { Context } from 'koa';
import { errorResponse } from '../utils/response';

export const errorHandler = async (ctx: Context, next: () => Promise<any>) => {
    try {
        // 執行下一個中介軟體，如果有錯誤會跳到 catch 區塊
        await next();
    } catch (err: any) {
        console.error('後端錯誤：', err);
        ctx.status = err.status || 500;
        ctx.body = errorResponse('伺服器錯誤');
    }
};