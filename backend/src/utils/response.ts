//data 使用泛型定義，根據傳入的 data 類型而定義型別
export const successResponse = <T>(data: T, message = '成功') => ({
    message,
    data,
});
export const errorResponse = (message = '伺服器錯誤') => ({
    message,
});