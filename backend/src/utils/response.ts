export const successResponse = (data: any, message = '成功') => ({
    success: true,
    message,
    data,
});

export const errorResponse = (message = '伺服器錯誤') => ({
    success: false,
    message,
});