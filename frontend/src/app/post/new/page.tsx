'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { getCategoryValue, getAvailableCategoryLabels, ArticleCategory } from '@/app/utils/constants';


// 動態導入 ReactQuill 以避免 SSR 問題
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false, //只在瀏覽器端載入
  loading: () => <p>載入編輯器中...</p>,
});

//定義表單資料的型別
type FormData = {
  category: ArticleCategory | '';
  author: string;
  title: string;
  content: string;
};

//定義表單錯誤顯示欄位的型別
type FormErrors = {
  category?: string;
  author?: string;
  title?: string;
  content?: string;
};

// Quill 編輯器的工具欄配置
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  ],
};

//使用者輸入內容允許的格式
const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align',
  'list', 'bullet',
  'link', 'image'
];

export default function NewPost() {
  const router = useRouter();
  //表單內容(文章)
  const [formData, setFormData] = useState<FormData>({
    category: '',
    author: '',
    title: '',
    content: '',
  });
  //出錯的欄位
  const [errors, setErrors] = useState<FormErrors>({});
  //提交狀態(防止重複提交)
  const [isSubmitting, setIsSubmitting] = useState(false);

  //表單輸入處理
  //React 傳給 onChange 事件處理器的一個事件物件 e 有三種型別
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    //更新表單內容
    setFormData(prev => ({
      ...prev,
      [name]: value //根據使用者輸入的欄位名稱更新對應欄位的值
    }));
    // 清除對應欄位的錯誤訊息
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  //編輯器內容更新
  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
    if (errors.content) {
      setErrors(prev => ({
        ...prev,
        content: undefined
      }));
    }
  };

  //表單驗證
  const validateForm = () => {
    const newErrors: FormErrors = {};
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

    if (!formData.category) {
      newErrors.category = '請選擇文章主題';
    }
    if (!formData.author) {
      newErrors.author = '請輸入作者名稱';
    }
    if (!formData.title) {
      newErrors.title = '請輸入文章標題';
    } else if (formData.title.length < 5) {
      newErrors.title = '標題至少需要5個字';
    }

    const contentText = stripHtml(formData.content);
    if (!contentText) {
      newErrors.content = '請輸入文章內容';
    } else if (contentText.length < 20) {
      newErrors.content = '內容至少需要20個字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      if (!formData.category) {
        throw new Error('請選擇文章主題');
      }

      const topicValue = getCategoryValue(formData.category as ArticleCategory);
      if (!topicValue) {
        throw new Error('無效的文章主題');
      }
      // 準備要發送的數據
      const postData = {
        title: formData.title,
        content: formData.content,
        topic: topicValue,
        authorName: formData.author,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      console.log(data)
      if (!res.ok) {
        throw new Error(data.message || '發布文章失敗');
      }
      alert(data.message);
      // 發布成功後跳轉到首頁
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('發布文章時發生錯誤：', error);
      alert('發布文章失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 表單內容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">新增文章</h1>

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
                {getAvailableCategoryLabels().map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
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
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.author
                  ? 'border-red-500 focus:ring-red-500 focus:ring-1'
                  : 'border-gray-300 focus:ring-blue-500 focus:ring-1'
                  }`}
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
                href="/"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {isSubmitting ? '發布中...' : '發布文章'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 