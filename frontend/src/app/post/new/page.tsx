'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// 動態導入 ReactQuill 以避免 SSR 問題
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>載入編輯器中...</p>,
});

type FormData = {
  category: string;
  author: string;
  title: string;
  content: string;
  images: string[];
  coverImageIndex: number | null;
};

// Quill 編輯器的工具欄配置
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    // ['link', 'image'],
    // ['clean']
  ],
};

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
  const [formData, setFormData] = useState<FormData>({
    category: '',
    author: '',
    title: '',
    content: '',
    images: [],
    coverImageIndex: null,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [useCoverImage, setUseCoverImage] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除對應欄位的錯誤訊息
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

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
    // 解析內容中的所有 <img> 標籤 src
    const imgSrcs = Array.from(
      content.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/g)
    ).map(match => match[1]);
    setFormData(prev => ({
      ...prev,
      images: imgSrcs
    }));
    // 若目前封面圖已不存在於新圖片清單，則取消封面圖
    if (
      formData.coverImageIndex !== null &&
      (imgSrcs.length === 0 || formData.coverImageIndex >= imgSrcs.length)
    ) {
      setFormData(prev => ({
        ...prev,
        coverImageIndex: null
      }));
      setUseCoverImage(false);
    }
    // 若有圖片且尚未選封面，預設第一張
    if (imgSrcs.length > 0 && formData.coverImageIndex === null && useCoverImage) {
      setFormData(prev => ({
        ...prev,
        coverImageIndex: 0
      }));
    }
  };

  // 處理封面圖片選擇
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUseCoverImage(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        coverImageIndex: currentSlide
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        coverImageIndex: null
      }));
    }
  };

  // 處理輪播器切換
  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
    if (useCoverImage) {
      setFormData(prev => ({
        ...prev,
        coverImageIndex: index
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // 將中文分類轉換為後端定義的 Topic 枚舉
      const topicMap: Record<string, 'FOOD' | 'STAY' | 'SPOT' | 'OTHERS'> = {
        '美食': 'FOOD',
        '住宿': 'STAY',
        '景點': 'SPOT',
        '其他': 'OTHERS'
      };

      // 準備要發送的數據
      const postData = {
        title: formData.title,
        content: formData.content,
        topic: topicMap[formData.category],
        authorName: formData.author,
      };

      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '發布文章失敗');
      }

      const result = await response.json();
      console.log('文章發布成功：', result);
      
      // 發布成功後跳轉到首頁
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('發布文章時發生錯誤：', error);
      alert(error instanceof Error ? error.message : '發布文章失敗，請稍後再試');
    }
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
          </div>
        </div>
      </nav>

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
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
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
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.author ? 'border-red-500' : 'border-gray-300'
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
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
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

            {/* 圖片輪播器 */}
            {formData.images.length > 0 && (
              <div className="flex flex-col items-center mb-4">
                {/* 封面勾選框 */}
                <div className="flex items-center mb-2 w-full">
                  <input
                    type="checkbox"
                    id="useCoverImage"
                    checked={useCoverImage}
                    onChange={handleCoverImageChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <label htmlFor="useCoverImage" className="text-sm font-medium text-gray-700 select-none">
                    是否選擇文章縮圖
                  </label>
                </div>
                {/* 輪播主體 */}
                <div className="relative w-full max-w-2xl aspect-video bg-white rounded-xl shadow-lg flex items-center justify-center">
                  {/* 左箭頭 */}
                  <button
                    type="button"
                    onClick={() => handleSlideChange((currentSlide - 1 + formData.images.length) % formData.images.length)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-4 group"
                    style={{ minWidth: 48 }}
                  >
                    <span className="text-4xl text-blue-500 group-hover:text-blue-700 select-none">&#60;</span>
                  </button>
                  {/* 圖片 */}
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={formData.images[currentSlide]}
                      alt={`上傳圖片 ${currentSlide + 1}`}
                      className="object-contain max-h-full max-w-full rounded-lg"
                    />
                    {useCoverImage && formData.coverImageIndex === currentSlide && (
                      <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm shadow">
                        文章縮圖
                      </div>
                    )}
                  </div>
                  {/* 右箭頭 */}
                  <button
                    type="button"
                    onClick={() => handleSlideChange((currentSlide + 1) % formData.images.length)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-4 group"
                    style={{ minWidth: 48 }}
                  >
                    <span className="text-4xl text-blue-500 group-hover:text-blue-700 select-none">&#62;</span>
                  </button>
                  {/* 導覽點 */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
                    {formData.images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSlideChange(idx)}
                        className={`w-3 h-3 rounded-full border-2 ${
                          idx === currentSlide ? 'bg-blue-500 border-blue-500' : 'bg-white border-blue-300'
                        }`}
                        aria-label={`切換到第${idx + 1}張圖片`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            

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
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                發布文章
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
} 