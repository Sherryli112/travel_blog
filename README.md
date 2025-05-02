# blog project 
一個簡易的部落格系統，具備文章與留言功能，使用 RESTful API 架構設計，資料儲存於 PostgreSQL 資料庫

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
├── frontend/             # 前端專案 (Next.js)
├── prisma/               # Prisma schema 與 migration 設定
├── generated/            # Prisma Client 輸出（透過 generate 指令）
├── docker-compose.yml    # 資料庫容器設定
├── .env                  # 環境變數設定（未加入 Git）
├── README.md             # 本說明文件
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

enum Topic {
  FOOD
  STAY
  SPOT
  OTHERS
}

model Post {
  id         Int       @id @default(autoincrement())
  title      String
  content    String    @db.Text
  topic      Topic     @default(OTHERS)
  authorName String
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  comments   Comment[]
  @@index([topic])
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  userName  String
  createdAt DateTime @default(now())
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    Int
  @@index([postId])
}
```

---

## REST API 設計（摘要）

| 方法     | 路徑                          | 說明                   |
|----------|-------------------------------|------------------------|
| GET      | `/api/posts`                  | 取得文章列表（含分頁）   |
| GET      | `/api/posts/:id`              | 取得單篇文章            |
| POST     | `/api/posts`                  | 新增文章               |
| PUT      | `/api/posts/:id`              | 編輯文章               |
| DELETE   | `/api/posts/:id`              | 刪除文章               |
| GET      | `/api/posts/:id/comments`     | 取得指定文章的留言列表   |
| POST     | `/api/posts/:id/comments`     | 新增留言               |
| DELETE   | `/api/comments/:id`           | 刪除留言（含簡易驗證）  |

---

## 專案啟動流程

### 安裝依賴

```bash
npm install
```

### 啟動 PostgreSQL（Docker）

```bash
docker compose up -d
```

### 建立資料表（Prisma Migration）

```bash
npx prisma migrate dev --name init
```

### 啟動前端（Next.js）

```bash
cd frontend
npm install
npm run dev
```

### Prisma Studio（可視化操作資料庫）

```bash
npx prisma studio
```

---

## 功能與進度追蹤

- [x] 建立資料庫 schema（Prisma）
- [ ] 設計後端 API（文章與留言 CRUD）
- [ ] 串接 Prisma 與資料庫
- [ ] 撰寫前端頁面（文章列表 / 詳情 / 表單）
- [ ] 串接 API
- [ ] 實作留言功能與基本驗證
- [ ] 撰寫 API 文件
- [ ] RWD 調整（可選）
- [ ] 整合部署（可選）

---

## 補充說明

- `frontend/` 內含 Next.js 專案，請參考其內部的 [`README.md`](./frontend/README.md)
- 本專案未實作登入機制，留言僅使用使用者輸入的暱稱進行驗證

---

## 可拓展功能

- 使用者登入 / 驗證機制
- 後端單元測試（Mocha）