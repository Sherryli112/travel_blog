"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const errorHandler = async (ctx, next) => {
    try {
        await next();
    }
    catch (err) {
        console.error('後端錯誤：', err);
        ctx.status = err.status;
        ctx.body = (0, response_1.errorResponse)('伺服器錯誤');
    }
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map