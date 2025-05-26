'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { getCategoryLabel } from '@/app/utils/constants';
import dayjs from '@/app/utils/dayjs';

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


const formatDate = (isoString: string): string => dayjs(isoString).tz('Asia/Taipei').format('YYYY-MM-DD');

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);
  //文章內容
  const [post, setPost] = useState<Post | null>(null);
  //載入狀態
  const [loading, setLoading] = useState(true);
  //取得留言的陣列
  const [comments, setComments] = useState<Comment[]>([]);
  //留言操作成功提示
  const [commentHandleMessage, setCommentHandleMessage] = useState('');
  //留言新增或刪除修改顏色
  const [commentMessageType, setCommentMessageType] = useState<'success' | 'error' | ''>('');
  //新增留言框 - 作者
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  //新增留言框 - 內容
  const [newComment, setNewComment] = useState('');
  //新增留言框 - 作者沒填
  const [authorError, setAuthorError] = useState('');
  //新增留言框 - 內容沒填
  const [contentError, setContentError] = useState('');
  //是否顯示全部留言
  const [showAllComments, setShowAllComments] = useState(false);
  //刪除留言的ID
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  //刪除留言確認框的使用者名稱
  const [deleteInput, setDeleteInput] = useState('');
  //刪除留言的確認框 - 使用者名稱輸入錯誤提示
  const [deleteError, setDeleteError] = useState('');
  //刪除文章確認框的使用者名稱
  const [postDeleteInput, setPostDeleteInput] = useState('');
  //刪除文章的確認框 - 使用者名稱輸入錯誤提示
  const [postDeleteError, setPostDeleteError] = useState('');
  //刪除文章的確認框是否顯示
  const [showPostDeleteModal, setShowPostDeleteModal] = useState(false);



  //獲取留言
  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '取得留言失敗');
      setComments(data.data);
    } catch (error) {
      console.error('取得留言失敗:', error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || '找不到文章');
        setPost(data.data);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commenterName: newCommentAuthor,
          content: newComment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '留言失敗');
      }

      await fetchComments();
      setNewComment('');
      setNewCommentAuthor('');
      setCommentHandleMessage('留言新增成功');
      setCommentMessageType('success');
      setTimeout(() => setCommentHandleMessage(''), 3000);
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

  // 刪除留言確認
  const confirmDelete = async () => {
    const target = comments.find(c => c.id === deleteTargetId);
    if (!target) return;

    if (deleteInput !== target.commenter.name) {
      setDeleteError('名稱不正確，無法刪除留言');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${deleteTargetId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commenterName: deleteInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '刪除失敗');
      }
      await fetchComments(); // 重新取得留言
      setDeleteTargetId(null);
      setDeleteInput('');
      setDeleteError('');
      setCommentHandleMessage('留言已成功刪除');
      setCommentMessageType('error');
      setTimeout(() => setCommentHandleMessage(''), 3000);
    } catch (error) {
      console.error('刪除留言失敗：', error);
      setDeleteError('刪除留言失敗，請稍後再試');
    }
  };

  // 取消刪除留言
  const cancelDelete = () => {
    setDeleteTargetId(null);
    setDeleteInput('');
    setDeleteError('');
  };

  //刪除文章
  const handleConfirmPostDelete = async () => {
    const authorName = postDeleteInput
    const postAuthorName = post?.author.name
    if (authorName !== postAuthorName) {
      setPostDeleteError('名稱不正確，無法刪除文章');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '刪除失敗');
      }
      cancelPostDelete()
      alert(data.message)
      router.replace('/');
    } catch (error) {
      console.error('刪除文章失敗:', error);
      setPostDeleteError('刪除文章失敗，請稍後再試');
    }
  };

  const cancelPostDelete = () => {
    setShowPostDeleteModal(false);
    setPostDeleteInput('');
    setPostDeleteError('');
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
            <div className='flex justify-between items-center mb-4'>
              <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
              <div className='flex space-x-3 shrink-0'>
                <Link href={`${postId}/edit`} aria-label="編輯文章">
                  <span>
                    <PencilSquareIcon className="w-6 h-6 text-blue-500 hover:text-blue-600 cursor-pointer" />
                  </span>
                </Link>
                <TrashIcon
                  onClick={() => {
                    setShowPostDeleteModal(true);
                    setPostDeleteInput('');
                    setPostDeleteError('');
                  }}
                  className="w-6 h-6 text-blue-500 hover:text-blue-600 cursor-pointer" />
              </div>
            </div>
            <div className="flex items-center mb-6">
              <span className="text-gray-600">作者：{post.author.name}</span>
            </div>
            <div className="prose max-w-none content" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>
        {/* 刪除文章驗證彈窗 */}
        {showPostDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={cancelPostDelete}>
            <div className="bg-white p-6 rounded shadow-md w-80" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">刪除文章確認</h2>
              <p className="text-sm text-gray-600 mb-2">請輸入作者名稱以確認刪除：</p>
              <input
                type="text"
                value={postDeleteInput}
                onChange={(e) => setPostDeleteInput(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {postDeleteError && <p className="text-sm text-red-500 mb-2">{postDeleteError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelPostDelete}
                  className="text-gray-600 hover:underline px-2 py-1"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmPostDelete}
                  className="text-red-600 hover:underline px-2 py-1"
                >
                  確認刪除
                </button>
              </div>
            </div>
          </div>
        )}


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
        {commentHandleMessage && (
          <div
            className={`mb-4 px-4 py-2 rounded border ${commentMessageType === 'success'
              ? 'bg-green-100 text-green-600 border-green-300'
              : commentMessageType === 'error'
                ? 'bg-red-100 text-red-600 border-red-300'
                : ''
              }`}
          >
            {commentHandleMessage}
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
              {/* 刪除留言驗證彈窗 */}
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