import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password, name, action } = await request.json();

    if (action === 'register') {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanılıyor' },
          { status: 400 }
        );
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        return NextResponse.json(
          { error: signUpError.message },
          { status: 400 }
        );
      }

      // Kullanıcı profili oluştur
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user?.id,
            email,
            name,
            role: 'user',
          },
        ]);

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ message: 'Kayıt başarılı' });
    }

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json(
          { error: 'Geçersiz email veya şifre' },
          { status: 401 }
        );
      }

      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'Geçersiz işlem' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 