'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import dayjs from '@/app/utils/dayjs';
import { categoryOptions, getCategoryLabel } from '@/app/utils/constants';

//文章類型
type Post = {
  id: number;
  title: string;
  content: string;
  topic: 'FOOD' | 'STAY' | 'SPOT' | 'OTHERS';
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    createdAt: string;
  };
  comments: Comment[];
};

//每頁幾篇(目前暫定一頁 10 篇，可再做調整)
const POSTS_PER_PAGE = 10;

//時間格式調整
const formatDate = (isoString: string): string => dayjs(isoString).tz('Asia/Taipei').format('YYYY-MM-DD');

export default function Home() {
  //後端回傳文章總數
  const [total, setTotal] = useState(0);
  //目前此頁的文章資料
  const [posts, setPosts] = useState<Post[]>([]);
  //處理載入與錯誤狀態
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //篩選目前的文章主題
  const [selectedCategory, setSelectedCategory] = useState('');
  //目前頁碼
  const [currentPage, setCurrentPage] = useState(1);
  //還沒按下送出的作者名稱
  const [searchInput, setSearchInput] = useState('');
  //送出的作者名稱
  const [searchAuthor, setSearchAuthor] = useState('');


  // 文章數據
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (selectedCategory) params.append('topic', selectedCategory);
        if (searchAuthor) params.append('author', searchAuthor);
        params.append('page', currentPage.toString());
        params.append('pageSize', POSTS_PER_PAGE.toString());
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?${params.toString()}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || '伺服器錯誤');
        }

        setPosts(result.data.posts);
        setTotal(result.data.total);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('無法載入文章');
        setLoading(false);
      }
    };
    fetchPosts();
  }, [selectedCategory, searchAuthor, currentPage]);


  // 計算分頁
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  // 當篩選條件改變時，重置到第一頁
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchAuthor]);

  // 處理搜尋
  const handleSearch = () => {
    setSearchAuthor(searchInput);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">載入中…</h1>
          </div>
        </div>
      </>
    );
  }
  if (error) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 搜尋和篩選區域*/}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
          {/* 主題篩選 */}
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map(({ label, value }) => (
              <button
                key={value || '全部'}
                onClick={() => setSelectedCategory(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  ${selectedCategory === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* 作者搜尋 */}
          <div className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0 relative">
            <input
              type="text"
              placeholder="搜尋作者..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            {/* 清除搜尋按鈕 */}
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
          {posts.map((posts) => (
            <Link href={`/post/${posts.id}`} key={posts.id} className="block group">
              <article
                className="flex flex-col sm:flex-row items-stretch bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg transition-shadow overflow-hidden group-hover:bg-gray-50"
              >
                {/* 內容區 */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  {/* 作者與分類 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-800 text-sm font-medium mr-2">{posts.author.name}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {getCategoryLabel(posts.topic)}
                    </span>
                  </div>
                  {/* 標題 */}
                  <h2 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                    {posts.title}
                  </h2>
                  {/* 摘要 */}
                  <p className="text-gray-600 text-base mb-3 line-clamp-2">
                    {posts.content.replace(/<[^>]+>/g, '')}
                  </p>
                  {/* 日期 */}
                  <div className="flex items-center text-xs text-gray-400 gap-4 mt-auto">
                    <span>{formatDate(posts.updatedAt)}</span>
                  </div>
                </div>

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
          共找到 {total} 篇文章
        </div>
      </div>
    </>

  );
}


