"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname(); // 取得目前的路徑
    const isOnNewPostPage = pathname === "/post/new"; // 判斷是不是在新增文章頁面
    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-gray-900">
                            旅遊部落格
                        </Link>
                    </div>
                    <div className="flex space-x-4">
                        {!isOnNewPostPage && (<Link
                            href="/post/new"
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            新增文章
                        </Link>)}
                    </div>
                </div>
            </div>
        </nav>
    );
}