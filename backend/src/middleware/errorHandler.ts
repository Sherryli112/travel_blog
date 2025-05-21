import { Context } from 'koa';
import { errorResponse } from '../utils/response';
// import { Prisma } from '@prisma/client';

export const errorHandler = async (ctx: Context, next: () => Promise<any>) => {
    try {
        await next();
    } catch (err: any) {
        console.error('後端錯誤：', err);
        ctx.status = err.status || 500;
        ctx.body = errorResponse('伺服器錯誤');
    }
};

// export const errorHandler = async (ctx: Context, next: () => Promise<any>) => {
//     try {
//         await next();
//     } catch (err: any) {
//         console.error('後端錯誤：', err);

//         // 預設
//         let statusCode = err.status || 500;
//         let message = '伺服器錯誤';
//         let code = 'INTERNAL_SERVER_ERROR';

//         // 針對 Prisma 特定錯誤分類處理
//         // if (err instanceof Prisma.PrismaClientKnownRequestError) {
//         //     statusCode = 400;
//         //     message = '資料庫請求錯誤';
//         //     code = err.code;
//         // } else if (err instanceof Prisma.PrismaClientInitializationError) {
//         //     statusCode = 500;
//         //     message = '資料庫初始化失敗，請確認資料庫是否有啟動';
//         //     code = 'DATABASE_INIT_ERROR';
//         // } else if (err instanceof Prisma.PrismaClientRustPanicError) {
//         //     statusCode = 500;
//         //     message = '資料庫錯誤（Rust Panic）';
//         //     code = 'DATABASE_PANIC';
//         // } else if (err.code === 'ECONNREFUSED') {
//         //     statusCode = 500;
//         //     message = '無法連線至資料庫，請確認服務是否啟動';
//         //     code = 'DATABASE_CONNECTION_ERROR';
//         // }


//         // 錯誤類型判斷（比 instanceof 更穩定）
//         if (err.name === 'PrismaClientInitializationError') {
//             message = '資料庫初始化失敗，請確認資料庫是否有啟動';
//             code = 'DATABASE_INIT_ERROR';
//         } else if (err.name === 'PrismaClientRustPanicError') {
//             message = '資料庫錯誤（Rust Panic）';
//             code = 'DATABASE_PANIC';
//         } else if (err.name === 'PrismaClientKnownRequestError') {
//             message = '資料庫請求錯誤';
//             code = err.code || 'DATABASE_KNOWN_ERROR';
//         } else if (err.code === 'ECONNREFUSED') {
//             message = '無法連線至資料庫，請確認服務是否啟動';
//             code = 'DATABASE_CONNECTION_ERROR';
//         }

//         // 統一格式回應
//         ctx.status = statusCode;
//         ctx.body = errorResponse(message, code);
//     }
// };