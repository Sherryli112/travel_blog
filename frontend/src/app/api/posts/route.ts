import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: 這裡需要連接到您的資料庫
    // 目前只是模擬成功回應
    console.log('收到的文章數據：', body);

    return NextResponse.json(
      { message: '文章發布成功', data: body },
      { status: 201 }
    );
  } catch (error) {
    console.error('處理文章發布時發生錯誤：', error);
    return NextResponse.json(
      { message: '發布文章失敗' },
      { status: 500 }
    );
  }
} 