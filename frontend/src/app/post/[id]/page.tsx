'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';

// 定義留言類型
type Comment = {
  id: number;
  author: string;
  content: string;
  date: string;
};

// 模擬文章數據庫
const posts = [
  {
    id: 1,
    title: '美食文章1',
    content: `這是我的第一篇美食文章的詳細內容。在這裡，我將分享我在台北發現的一家隱藏版美食餐廳。

這家餐廳位於台北市信義區的一條小巷中，雖然位置不太起眼，但卻是我近期發現的最棒的餐廳之一。

餐廳的招牌菜是他們的招牌牛肉麵，湯頭濃郁，牛肉軟嫩，麵條彈牙。除此之外，他們的小菜也相當出色，特別是滷味拼盤，每一樣都滷得恰到好處。

價格方面，雖然不是最便宜的選擇，但考慮到食材的品質和料理的水準，絕對是物超所值。`,
    date: '2024-03-20',
    author: '作者名稱',
    category: '美食'
  },
  {
    id: 2,
    title: '住宿文章1',
    content: '這是住宿文章的詳細內容...',
    date: '2024-03-19',
    author: '作者名稱',
    category: '住宿'
  }
];

// 模擬留言數據
const initialComments: Comment[] = [
  {
    id: 1,
    author: '訪客1',
    content: '這家餐廳我也去過，真的很棒！',
    date: '2024-03-20 14:30'
  },
  {
    id: 2,
    author: '訪客2',
    content: '請問這家餐廳的營業時間是？',
    date: '2024-03-20 15:45'
  },
  {
    id: 3,
    author: '訪客3',
    content: '看起來好好吃，下次一定要去試試！',
    date: '2024-03-20 16:20'
  },
  {
    id: 4,
    author: '訪客4',
    content: '他們的牛肉麵真的是一絕，湯頭很濃郁。',
    date: '2024-03-20 17:15'
  },
  {
    id: 5,
    author: '訪客5',
    content: '感謝分享，這週末就去試試看！',
    date: '2024-03-20 18:00'
  }
];

export default function PostDetail() {
  const params = useParams();
  const postId = Number(params.id);
  const [post, setPost] = useState(posts.find(p => p.id === postId));
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number|null>(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // 如果找不到文章，顯示錯誤訊息
  if (!post) {
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                  旅遊部落格
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到文章</h1>
            <p className="text-gray-600 mb-4">您要查看的文章不存在或已被刪除。</p>
            <Link href="/" className="text-blue-500 hover:text-blue-600">
              返回首頁
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 留言排序由新到舊
  const sortedComments = [...comments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // 顯示留言（預設3則，展開全部）
  const visibleComments = showAllComments ? sortedComments : sortedComments.slice(0, 3);

  // 新增留言
  const handleSubmitComment = () => {
    if (!newComment.trim() || !newCommentAuthor.trim()) return;
    const now = dayjs();
    const comment: Comment = {
      id: comments.length + 1,
      author: newCommentAuthor,
      content: newComment,
      date: now.format('YYYY-MM-DD HH:mm')
    };
    setComments([comment, ...comments]); // 新留言加在最前面
    setNewComment('');
    setNewCommentAuthor('');
  };

  // 刪除留言驗證
  const handleDeleteComment = (id: number) => {
    setDeleteTargetId(id);
    setDeleteInput('');
    setDeleteError('');
  };
  const confirmDelete = () => {
    const target = comments.find(c => c.id === deleteTargetId);
    if (!target) return;
    if (deleteInput.trim() !== target.author) {
      setDeleteError('名稱不正確，無法刪除留言');
      return;
    }
    setComments(comments.filter(c => c.id !== deleteTargetId));
    setDeleteTargetId(null);
    setDeleteInput('');
    setDeleteError('');
  };
  const cancelDelete = () => {
    setDeleteTargetId(null);
    setDeleteInput('');
    setDeleteError('');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                旅遊部落格
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link href="/post/new" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                新增文章
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 文章內容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {post.category}
              </span>
              <span className="text-gray-500 text-sm">{post.date}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="flex items-center mb-6">
              <span className="text-gray-600">作者：{post.author}</span>
            </div>
            <div className="prose max-w-none">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>

        {/* 留言區 */}
        <h2 className="text-2xl font-bold text-gray-900 p-6">留言區</h2>
        {/* 留言輸入框 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              placeholder="留言者名稱 (必填)"
              value={newCommentAuthor}
              onChange={e => setNewCommentAuthor(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="請輸入您的留言..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            rows={4}
          />
          <button
            onClick={handleSubmitComment}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
            disabled={!newComment.trim() || !newCommentAuthor.trim()}
          >
            送出留言
          </button>
        </div>
        {/* 留言列表 */}
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow-md p-6 relative">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">{comment.author}</span>
                <span className="text-sm text-gray-500">{comment.date}</span>
              </div>
              <p className="text-gray-700 mb-2">{comment.content}</p>
              {/* <button
                className="absolute top-2 right-2 text-xs text-red-500 hover:underline"
                onClick={() => handleDeleteComment(comment.id)}
              >
                刪除
              </button> */}
              {/* 刪除驗證彈窗 */}
              {deleteTargetId === comment.id && (
                <div className="absolute top-8 right-2 bg-white border border-gray-300 rounded shadow-lg p-4 z-20 w-64">
                  <div className="mb-2 text-sm text-gray-700">請輸入留言者名稱以確認刪除：</div>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={e => setDeleteInput(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                  />
                  {deleteError && <div className="text-xs text-red-500 mb-2">{deleteError}</div>}
                  <div className="flex justify-end gap-2">
                    <button onClick={cancelDelete} className="px-2 py-1 text-gray-500 hover:underline">取消</button>
                    <button onClick={confirmDelete} className="px-2 py-1 text-red-600 hover:underline">確認刪除</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* 顯示更多/收起留言按鈕 */}
        {sortedComments.length > 3 && !showAllComments && (
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => setShowAllComments(true)}
            >
              顯示更多留言
            </button>
          </div>
        )}
        {sortedComments.length > 3 && showAllComments && (
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => setShowAllComments(false)}
            >
              收起留言
            </button>
          </div>
        )}
      </div>
    </main>
  );
} 