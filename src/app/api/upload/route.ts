import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Auth header'i yoxlayırıq
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Autentifikasiya tələb olunur' },
        { status: 401 }
      );
    }

    // Token'i əldə edirik
    const token = authHeader.split(' ')[1];

    // Supabase client'i yaradırıq və token'i təyin edirik
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
    });

    // Session'u yoxlayırıq
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth xətası:', authError);
      return NextResponse.json(
        { error: 'Autentifikasiya xətası' },
        { status: 401 }
      );
    }

    console.log('Upload tələbi alındı');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('Fayl tapılmadı');
      return NextResponse.json(
        { error: 'Fayl tapılmadı' },
        { status: 400 }
      );
    }

    console.log('Fayl məlumatları:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (file.size > 5 * 1024 * 1024) {
      console.log('Fayl həcmi çox böyükdür');
      return NextResponse.json(
        { error: 'Fayl həcmi 5MB-dan çox olmamalıdır' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExt || '')) {
      console.log('Dəstəklənməyən fayl formatı:', fileExt);
      return NextResponse.json(
        { error: 'Yalnız JPG, PNG və WEBP formatları dəstəklənir' },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `book-covers/${fileName}`;

    console.log('Şəkil emal edilir...');

    try {
      const resizedImageBuffer = await sharp(buffer)
        .resize({
          width: 800,
          height: 1200,
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toBuffer();

      console.log('Şəkil yenidən ölçüləndirildi');

      console.log('Şəkil yüklənir...');
      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(filePath, resizedImageBuffer, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Yükləmə xətası:', uploadError);
        throw new Error(`Yükləmə xətası: ${uploadError.message}`);
      }

      console.log('Şəkil uğurla yükləndi');

      const { data: { publicUrl } } = supabase.storage
        .from('books')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      return NextResponse.json({ url: publicUrl });

    } catch (error) {
      console.error('Sharp veya Supabase xətası:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Şəkil emal edilərkən xəta baş verdi' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Ümumi xəta:', error);
    return NextResponse.json(
      { error: 'Şəkil yüklənərkən xəta baş verdi' },
      { status: 500 }
    );
  }
} 