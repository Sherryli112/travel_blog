export const successResponse = (data: any, message = '成功') => ({
    message,
    data,
});

export const errorResponse = (message = '伺服器錯誤') => ({
    message,
});