//TypeScript 的語法，從 Next.js 引入 Metadata 型別
//定義頁面的 <title>、<meta description> 等資訊的結構
import type { Metadata } from "next";
//引入 Google Fonts 中的 Inter 字型
import { Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
//next 內建的字體載入功能
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap', //字體載入前用預設樣式顯示，避免閃爍
});

//配置中文字型
const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ['400', '500', '700'], // 可選擇需要的字重
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "旅遊部落格",
  description: "旅遊部落格系統",
};
//使用 React.ReactNode 來定義 children 必須是可以被 React 渲染的
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.variable} ${notoSansTC.variable}`}>
        <Navbar></Navbar>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
