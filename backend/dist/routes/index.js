"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const posts_1 = __importDefault(require("./posts"));
const comments_1 = __importDefault(require("./comments"));
const router = new koa_router_1.default();
router.use(posts_1.default.routes());
router.use(comments_1.default.routes());
exports.default = router;
//# sourceMappingURL=index.js.map