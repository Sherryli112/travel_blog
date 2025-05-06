'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// 定義文章類型
type Post = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: '美食' | '住宿' | '景點' | '其他';
  coverImage?: string;
};

// 模擬文章數據
const posts: Post[] = [
  {
    id: 1,
    title: '美食文章1',
    excerpt: '這是我的第一篇美食文章的摘要內容，介紹了一些基本美食...',
    date: '2024-03-20',
    author: 'Brain',
    category: '美食',
    // coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    title: '住宿文章1',
    excerpt: '這是我的第一篇住宿文章的摘要內容，介紹了一些基本住宿...',
    date: '2024-03-19',
    author: 'Tina',
    category: '住宿',
    coverImage: undefined
  },
  {
    id: 3,
    title: '景點文章1',
    excerpt: '這是我的第一篇景點文章的摘要內容，介紹了一些基本景點...',
    date: '2024-03-18',
    author: 'Tina',
    category: '景點',
    // coverImage: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    title: '美食文章2',
    excerpt: '這是我的第二篇美食文章的摘要內容...',
    date: '2024-03-17',
    author: 'Brain',
    category: '美食'
  },
  {
    id: 5,
    title: '其他文章1',
    excerpt: '這是一篇其他類型的文章...',
    date: '2024-03-16',
    author: 'Peter',
    category: '其他'
  },
  {
    id: 6,
    title: '其他文章1',
    excerpt: '這是一篇其他類型的文章...',
    date: '2024-03-16',
    author: 'Brain',
    category: '其他'
  },
  ,
  {
    id: 7,
    title: '住宿文章2',
    excerpt: '這是一篇其他類型的文章...',
    date: '2024-03-16',
    author: 'Peter',
    category: '住宿'
  },
  ,
  {
    id: 8,
    title: '其他文章1',
    excerpt: '這是一篇其他類型的文章...',
    date: '2024-03-16',
    author: 'Peter',
    category: '其他'
  },
  ,
  {
    id: 9,
    title: '其他文章1',
    excerpt: '這是一篇其他類型的文章...',
    date: '2024-03-16',
    author: 'Peter',
    category: '其他'
  },
  ,
  {
    id: 10,
    title: '其他文章1',
    excerpt: '這是一篇其他類型的文章...',
    date: '2024-03-16',
    author: 'Peter',
    category: '其他'
  },
  ,
  {
    id: 11,
    title: '其他文章1',
    excerpt: '這是一篇其他類型的文章...',
    date: '2024-03-16',
    author: 'Amy',
    category: '其他'
  },
  
];

const POSTS_PER_PAGE = 10;
const categories = ['全部', '美食', '住宿', '景點', '其他'];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // 篩選文章
  const filteredPosts = posts.filter(post => {
    const categoryMatch = selectedCategory === '全部' || post.category === selectedCategory;
    const authorMatch = searchAuthor === '' || post.author.toLowerCase().includes(searchAuthor.toLowerCase());
    return categoryMatch && authorMatch;
  });

  // 計算分頁
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // 當篩選條件改變時，重置到第一頁
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchAuthor]);

  // 處理搜尋
  const handleSearch = () => {
    setSearchAuthor(searchInput);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* sticky 導航欄 */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">旅遊部落格</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/post/new" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                新增文章
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 搜尋和篩選區域 RWD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
          {/* 主題篩選 */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  ${selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 作者搜尋 RWD */}
          <div className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0 relative">
            <input
              type="text"
              placeholder="搜尋作者..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            {/* x 按鈕 */}
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setSearchAuthor(''); }}
                className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="清除搜尋"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              搜尋
            </button>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {paginatedPosts.map((post) => (
            <Link href={`/post/${post.id}`} key={post.id} className="block group">
              <article
                className="flex flex-col sm:flex-row items-stretch bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg transition-shadow overflow-hidden group-hover:bg-gray-50"
              >
                {/* 內容區 */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  {/* 作者與分類 */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* 假頭像 */}
                    {/* <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                      {post.author[0]}
                    </div> */}
                    <span className="text-gray-800 text-sm font-medium mr-2">{post.author}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{post.category}</span>
                  </div>
                  {/* 標題 */}
                  <h2 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                    {post.title}
                  </h2>
                  {/* 摘要 */}
                  <p className="text-gray-600 text-base mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  {/* 日期 */}
                  <div className="flex items-center text-xs text-gray-400 gap-4 mt-auto">
                    <span>{post.date}</span>
                  </div>
                </div>
                {/* 封面圖（右側） */}
                {post.coverImage && (
                  <div className="w-full sm:w-48 h-40 sm:h-auto flex-shrink-0 flex items-center justify-center bg-gray-100">
                    <img
                      src={post.coverImage}
                      alt="封面圖片"
                      className="object-cover w-full h-full rounded-none sm:rounded-r-lg"
                    />
                  </div>
                )}
              </article>
            </Link>
          ))}
        </div>

        {/* 分頁控制 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              上一頁
            </button>
            <span className="px-4 py-2 text-gray-700">
              第 {currentPage} 頁，共 {totalPages} 頁
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        )}

        {/* 顯示當前篩選結果數量 */}
        <div className="text-center mt-4 text-gray-600">
          共找到 {filteredPosts.length} 篇文章
        </div>
      </div>
    </main>
  );
}


