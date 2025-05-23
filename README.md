# Blog Project 
一個簡易的旅遊部落格系統，具備文章與留言功能，使用 RESTful API 架構設計，資料儲存於 PostgreSQL 資料庫

---

## 使用技術

- **前端框架**：Next.js
- **後端框架**：Koa.js
- **資料庫 ORM**：Prisma
- **資料庫**：PostgreSQL（Docker 管理）
- **CSS 工具**：Tailwind CSS
- **套件管理**：npm

---

## 專案結構
```
blog-project/
├── backend/           # 後端專案(Koa.js + Prisma)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   ├── prisma/        # Prisma schema + migrations
│   ├── generated/     # Prisma client
│   ├── package.json
│   └── tsconfig.json
├── frontend/          # 前端專案 (Next.js)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
└── docker-compose.yml # Docker 配置 (PostgreSQL 資料庫容器)
```

---

## 資料模型（Prisma）

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

//文章主題：美食、住宿、景點、其他
enum Topic {
  FOOD
  STAY
  SPOT
  OTHERS
}

//使用者模型
model User {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  posts     Post[]    // 發表的文章
  comments  Comment[] // 發表的留言
  createdAt DateTime  @default(now())
}

//文章模型
model Post {
  id        Int       @id @default(autoincrement())
  title     String
  content   String    @db.Text
  topic     Topic     @default(OTHERS)
  author    User    @relation(fields: [authorId], references: [id]) //關聯使用者
  authorId  Int
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  comments  Comment[] //與評論的一對多關聯

  @@index([topic])
  @@index([authorId])
}

//評論模型
model Comment {
  id          Int       @id @default(autoincrement())
  content     String    @db.Text
  commenter   User @relation(fields: [commenterId], references: [id]) //關聯使用者
  commenterId Int
  createdAt   DateTime  @default(now())
  post        Post      @relation(fields: [postId], references: [id], onDelete: Cascade) //關聯文章
  postId      Int

  @@index([postId])
  @@index([commenterId])
}
```

---

## REST API 設計（摘要）

| 方法     | 路徑                          | 說明                   |
|----------|-------------------------------|------------------------|
| GET      | `/api/posts`                  | 取得文章列表            |
| GET      | `/api/posts/:id`              | 取得單篇文章            |
| POST     | `/api/posts`                  | 新增文章               |
| PUT      | `/api/posts/:id`              | 編輯文章               |
| POST     | `/api/posts/:id/delete`       | 刪除文章               |
| GET      | `/api/posts/:id/comments`     | 取得指定文章的留言列表   |
| POST     | `/api/posts/:id/comments`     | 新增留言               |
| POST     | `/api/comments/:id/delete`    | 刪除留言               |

---

## 專案啟動流程

### 啟動 Docker（也可直接打開 Docker Desktop 工具）

```bash
sc start com.docker.service (window)
```

### 安裝依賴

```bash
cd blog-project && npm install
cd backend && npm install
cd ../frontend && npm install
```

### 啟動 PostgreSQL（Docker）

```bash
cd blog-project
docker-compose up -d postgres
```

### 建立資料表（Prisma Migration，首次 clone 時）

```bash
cd backend
npx prisma migrate dev --name init
```

### 啟動前後端

```bash
cd blog-project
npm run dev
```

### Prisma Studio（可視化操作資料庫）

```bash
cd backend
npx prisma studio
```

---

## 專案部署流程

### 清空目前正在使用的容器、網路，並移除非 docker-compose.yml 中定義的容器

```bash
docker-compose down --remove-orphans
```

### 根據 Dockerfile 重新建構 Image

```bash
docker-compose build
```

### 啟動前後端資料庫容器

```bash
docker-compose up -d
```

### 修改程式碼後更新 Image + 重啟容器

```bash
docker-compose up -d --build
```

### 開啟預設網址

```
前端：http://localhost:4000
後端 API：http://localhost:4001/api/posts
```

### 停止容器

```bash
docker-compose down
```

---

## 功能與進度追蹤

- [x] 建立資料庫 schema（Prisma）
- [x] 撰寫前端頁面 + 基礎功能
- [x] 建立後端 API (Koa.js)
- [x] 前端串接 API

---

## 補充說明

- 本專案需要 Docker 環境，用於啟動 PostgreSQL 容器，請先安裝 Docker Desktop 並確認可正常執行 docker --version
- 本專案未實作登入機制，留言僅使用使用者輸入的暱稱進行驗證
- `frontend/` 內含 Next.js 專案，請參考其內部的 [`README.md`](./frontend/README.md)



---

## 可拓展功能

- [x] RWD 調整
- [x] 整合部署
- [ ] 使用者登入 / 驗證機制
- [ ] 後端單元測試（Mocha）