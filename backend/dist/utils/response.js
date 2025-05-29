"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data, message = '請求成功') => ({
    message,
    data,
});
exports.successResponse = successResponse;
const errorResponse = (message = '請求失敗') => ({
    message,
});
exports.errorResponse = errorResponse;
//# sourceMappingURL=response.js.map