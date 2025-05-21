"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data, message = '成功') => ({
    success: true,
    message,
    data,
});
exports.successResponse = successResponse;
const errorResponse = (message = '伺服器錯誤') => ({
    success: false,
    message,
});
exports.errorResponse = errorResponse;
//# sourceMappingURL=response.js.map