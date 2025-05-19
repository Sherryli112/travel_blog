"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const koa_1 = __importDefault(require("koa"));
const cors_1 = __importDefault(require("@koa/cors"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});
const app = new koa_1.default();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use((0, koa_bodyparser_1.default)());
app.use(routes_1.default.routes());
app.use(routes_1.default.allowedMethods());
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map