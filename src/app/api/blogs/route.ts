import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Tüm blogları getir
export async function GET() {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select(`
        *,
        users (
          name
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Blog oluştur
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { title, content, tags, coverImage } = await request.json();

    // Slug oluştur
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');

    const { data: blog, error } = await supabase
      .from('blogs')
      .insert([
        {
          title,
          content,
          tags,
          cover_image: coverImage,
          author_id: session.user.id,
          slug,
          status: 'draft'
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blog create error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 