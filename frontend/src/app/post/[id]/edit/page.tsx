'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>載入編輯器中...</p>,
});

type FormData = {
  category: string;
  author: string;
  title: string;
  content: string;
};

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  ],
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'align', 'list', 'bullet', 'link', 'image'
];

export default function EditPostPage() {
  const params = useParams();
  const paramsId = Number(params.id);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    author: '',
    title: '',
    content: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [authorInput, setAuthorInput] = useState('');
  const [authorError, setAuthorError] = useState('');
  const topicMap: Record<string, 'FOOD' | 'STAY' | 'SPOT' | 'OTHERS'> = {
    '美食': 'FOOD',
    '住宿': 'STAY',
    '景點': 'SPOT',
    '其他': 'OTHERS'
  };
  const reverseMap = {
    'FOOD': '美食',
    'STAY': '住宿',
    'SPOT': '景點',
    'OTHERS': '其他'
  };

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${paramsId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || '無法載入文章');

        setFormData({
          category: reverseMap[data.data.topic as 'FOOD' | 'STAY' | 'SPOT' | 'OTHERS'],
          author: data.data.author.name,
          title: data.data.title,
          content: data.data.content,
        });
      } catch (err) {
        console.error(err);
        alert('載入文章失敗');
      }
    }

    fetchPost();
  }, [paramsId]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

    if (!formData.category) newErrors.category = '請選擇文章主題';
    if (!formData.author) newErrors.author = '請輸入作者名稱';
    if (!formData.title) newErrors.title = '請輸入文章標題';
    else if (formData.title.length < 5) newErrors.title = '標題至少需要5個字';

    const contentText = stripHtml(formData.content);
    if (!contentText) newErrors.content = '請輸入文章內容';
    else if (contentText.length < 20) newErrors.content = '內容至少需要20個字';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setShowAuthorModal(true);
  };

  const handleConfirmEdit = async () => {
    if (authorInput !== formData.author) {
      setAuthorError('作者名稱不正確，無法編輯文章');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData = {
        title: formData.title,
        content: formData.content,
        topic: topicMap[formData.category],
        authorName: formData.author,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${paramsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '更新文章失敗');
      }

      alert(data.message);
      router.push(`/post/${paramsId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : '更新失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
      setShowAuthorModal(false);
      setAuthorInput('');
      setAuthorError('');
    }
  };

  const handleCancelEdit = () => {
    setShowAuthorModal(false);
    setAuthorInput('');
    setAuthorError('');
  };

  return (
    <>
      {/* 表單內容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">編輯文章</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 文章主題 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                文章主題 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.category
                  ? 'border-red-500 focus:ring-red-500 focus:ring-1'
                  : 'border-gray-300 focus:ring-blue-500 focus:ring-1'
                  }`}
              >
                <option value="">請選擇主題</option>
                <option value="美食">美食</option>
                <option value="住宿">住宿</option>
                <option value="景點">景點</option>
                <option value="其他">其他</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* 作者名稱 */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                作者名稱 <span className="text-red-500">*</span>
              </label>
              <input
                disabled
                type="text"
                id="author"
                name="author"
                value={formData.author}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
              {errors.author && (
                <p className="mt-1 text-sm text-red-500">{errors.author}</p>
              )}
            </div>

            {/* 文章標題 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                文章標題 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.title
                  ? 'border-red-500 focus:ring-red-500 focus:ring-1'
                  : 'border-gray-300 focus:ring-blue-500 focus:ring-1'
                  }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* 文章內容 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                文章內容 <span className="text-red-500">*</span>
              </label>
              <div className={`${errors.content ? 'border-red-500' : 'border-gray-300'}`}>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  className="bg-white"
                />
              </div>
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content}</p>
              )}
            </div>




            {/* 提交按鈕 */}
            <div className="flex justify-end space-x-4">
              <Link
                href={`/post/${paramsId}`}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {isSubmitting ? '編輯中...' : '確認編輯'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 作者驗證彈窗 */}
      {showAuthorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleCancelEdit}>
          <div className="bg-white p-6 rounded shadow-md w-80" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">編輯文章確認</h2>
            <p className="text-sm text-gray-600 mb-2">請輸入作者名稱以確認編輯：</p>
            <input
              type="text"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {authorError && <p className="text-sm text-red-500 mb-2">{authorError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="text-gray-600 hover:underline px-2 py-1"
              >
                取消
              </button>
              <button
                onClick={handleConfirmEdit}
                className="text-blue-600 hover:underline px-2 py-1"
              >
                確認編輯
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
