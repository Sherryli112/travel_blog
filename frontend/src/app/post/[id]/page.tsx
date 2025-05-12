'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';

//分類類型
const categoryOptions = [
  { label: '全部', value: '' },
  { label: '美食', value: 'FOOD' },
  { label: '住宿', value: 'STAY' },
  { label: '景點', value: 'SPOT' },
  { label: '其他', value: 'OTHERS' },
] as const;

//作者類型
type Author = {
  id: number;
  name: string;
  createdAt: string;
};

// 定義留言類型
type Comment = {
  id: number;
  content: string;
  commenter: {
    id: number;
    name: string;
    createdAt: string;
  };
  createdAt: string;
};

//文章類型
type Post = {
  id: number;
  title: string;
  content: string;
  topic: 'FOOD' | 'STAY' | 'SPOT' | 'OTHERS';
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: Author;
  comments: Comment[];
};

//分類類型對應
const getCategoryLabel = (value: Post['topic']) => {
  const category = categoryOptions.find(c => c.value === value);
  return category ? category.label : value;
};

//時間格式調整
// const formatDate = (isoString: string): string => {
//   const date = new Date(isoString);
//   const year = date.getFullYear();
//   const month = `${date.getMonth() + 1}`.padStart(2, '0');
//   const day = `${date.getDate()}`.padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };
const formatDate = (isoString: string): string => dayjs(isoString).format('YYYY-MM-DD');

export default function PostDetail() {
  const params = useParams();
  const postId = Number(params.id);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  // const [commentError, setCommentError] = useState('');
  const [commentErrors, setCommentErrors] = useState<{ author?: string; content?: string }>({});
  const [newComment, setNewComment] = useState('');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [authorError, setAuthorError] = useState('');
  const [contentError, setContentError] = useState('');

  //獲取留言
  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error('無法取得留言');
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error('取得留言失敗:', error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/posts/${postId}`);
        if (!res.ok) throw new Error('找不到文章');
        const data = await res.json();
        setPost(data);
      } catch (error) {
        console.error(error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(postId)) {
      fetchPost();
      fetchComments();
    }

  }, [postId]);

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

  if (!post) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到文章</h1>
            <p className="text-gray-600 mb-4">您要查看的文章不存在或已被刪除。</p>
            <Link href="/" className="text-blue-500 hover:text-blue-600">
              返回首頁
            </Link>
          </div>
        </div>
      </>
    );
  }


  // 留言排序由新到舊
  const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  // 顯示留言（預設3則，展開全部）
  const visibleComments = showAllComments ? sortedComments : sortedComments.slice(0, 3);

  // 驗證留言表單
  const validateCommentForm = () => {
    const trimmedAuthor = newCommentAuthor.trim();
    const trimmedContent = newComment.trim();

    let isValid = true;
    setAuthorError('');
    setContentError('');

    if (!trimmedAuthor) {
      setAuthorError('請輸入留言者名稱');
      isValid = false;
    } else if (trimmedAuthor.length < 2) {
      setAuthorError('留言者名稱至少需 2 個字');
      isValid = false;
    }

    if (!trimmedContent) {
      setContentError('請輸入留言內容');
      isValid = false;
    } else if (trimmedContent.length < 5) {
      setContentError('留言內容至少需 5 個字');
      isValid = false;
    }

    return isValid;
  };


  // 新增留言
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCommentForm()) return;
    try {
      const res = await fetch(`http://localhost:3001/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commenterName: newCommentAuthor,
          content: newComment,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '留言失敗');
      }
      await fetchComments();
      setNewComment('');
      setNewCommentAuthor('');
      // setCommentError('');
      setCommentErrors({});
    } catch (err: any) {
      console.error('留言失敗：', err.message);
      setContentError(err.message || '留言送出失敗，請稍後再試');
    }
  };





  // 刪除留言驗證
  const handleDeleteComment = (id: number) => {
    setDeleteTargetId(id);
    setDeleteInput('');
    setDeleteError('');
  };

  const confirmDelete = async () => {
    const target = comments.find(c => c.id === deleteTargetId);
    if (!target) return;

    if (deleteInput.trim().toLowerCase() !== target.commenter.name.trim().toLowerCase()) {
      setDeleteError('名稱不正確，無法刪除留言');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/comments/${deleteTargetId}?commenterName=${encodeURIComponent(deleteInput.trim())}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('刪除失敗');
      }

      await fetchComments(); // 重新取得留言
      setDeleteTargetId(null);
      setDeleteInput('');
      setDeleteError('');
      setDeleteSuccessMessage('留言已成功刪除');

      setTimeout(() => setDeleteSuccessMessage(''), 3000);
    } catch (error) {
      console.error('刪除留言失敗：', error);
      setDeleteError('刪除留言失敗，請稍後再試');
    }
  };

  const cancelDelete = () => {
    setDeleteTargetId(null);
    setDeleteInput('');
    setDeleteError('');
  };

  return (
    <>
      {/* 文章內容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {getCategoryLabel(post.topic)}
              </span>
              <span className="text-gray-500 text-sm">{formatDate(post.updatedAt)}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="flex items-center mb-6">
              <span className="text-gray-600">作者：{post.author.name}</span>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>

        {/* 留言區 */}
        <h2 className="text-2xl font-bold text-gray-900 p-6">留言區</h2>
        {/* 留言輸入框 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmitComment}>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                type="text"
                placeholder="留言者名稱 (必填)"
                value={newCommentAuthor}
                onChange={e => setNewCommentAuthor(e.target.value)}
                className={`flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${authorError ? 'border-red-500 focus:ring-red-500 focus:ring-1' : 'border-gray-300 focus:ring-blue-500'}`}
              /> 
            </div>
            {authorError && <div className="text-red-500 text-sm mt-1 mb-2">{authorError}</div>}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="請輸入您的留言..."
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 mb-1 ${contentError ? 'border-red-500 focus:ring-red-500 focus:ring-1' : 'border-gray-300 focus:ring-blue-500'}`}
              rows={4}
            />
            {contentError && <div className="text-red-500 text-sm mb-2">{contentError}</div>}

            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
            >
              送出留言
            </button>
          </form>
        </div>
        {/* 留言列表 */}
        {deleteSuccessMessage && (
          <div className="text-green-600 bg-green-100 border border-green-300 px-4 py-2 rounded mb-4">
            {deleteSuccessMessage}
          </div>
        )}
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow-md p-6 relative">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">{comment.commenter.name}</span>
                <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-700 mb-2">{comment.content}</p>
                <button
                  className="ml-2 text-xs text-red-500 hover:underline shrink-0 pl-6"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  刪除
                </button>
              </div>
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
    </>
  );
} 