# frontend - Next.js 前端專案

本資料夾為 blog 專案的前端應用，使用 [Next.js](https://nextjs.org/) 建構，負責文章與留言的顯示與互動。

---

## 使用技術

- **React 框架**：Next.js 13+
- **CSS 工具**：Tailwind CSS
- **API 串接**：使用 fetch 連接後端 Koa REST API
- **狀態管理**：使用 React 狀態與 useEffect 控制流程

---

## 啟動方式

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器並前往 `http://localhost:3000` 查看畫面。

---

## 預期頁面與功能

| 頁面             | 路徑            | 功能描述                         |
|------------------|-----------------|----------------------------------|
| 首頁             | `/`             | 顯示文章列表（摘要）             |
| 文章詳情         | `/post/[id]`    | 顯示文章內容與留言列表           |
| 新增文章         | `/post/new`     | 建立新文章表單                   |
| 編輯文章         | `/post/[id]/edit` | 編輯既有文章                     |

---

## 可用指令

| 指令           | 說明                     |
|----------------|--------------------------|
| `npm run dev`  | 啟動開發模式伺服器       |
| `npm run build`| 編譯生產環境版本         |
| `npm run start`| 啟動 Next.js 生產環境伺服器（需先 build） |
| `npm run lint` | 執行 ESLint 代碼檢查     |

---

## 備註

- 本前端專案會透過環境變數（例如 `NEXT_PUBLIC_API_BASE_URL`）與後端串接
- Tailwind CSS 已於專案初始化階段設定完成
- 請確保後端 API 啟動於可供前端存取的端口（例如 `http://localhost:3001`）