// export const successResponse = (data: any = {}, message = '成功') => ({
//     success: true,
//     data,
//     message,
// });

// export const errorResponse = (message = '發生錯誤', code = 'UNKNOWN_ERROR') => ({
//     success: false,
//     message,
//     code,
// });
// utils/response.ts

// export const successResponse = <T>(data: T, message = '成功') => ({
//     success: true,
//     message,
//     data,
// });

// export const errorResponse = (message = '失敗', code?: string) => ({
//     success: false,
//     message,
//     code,
// });
export const successResponse = (data: any, message = '成功') => ({
    success: true,
    message,
    data,
});

export const errorResponse = (message = '伺服器錯誤') => ({
    success: false,
    message,
});