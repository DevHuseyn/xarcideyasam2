import { supabase } from '../lib/supabase';

async function createAdmin() {
  try {
    // Admin kullanıcısını oluştur
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'turalxaricde@xaricdeyasam.com',
      password: 'resadxaricde',
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!authData.user) {
      throw new Error('Kullanıcı oluşturulamadı');
    }

    // Kullanıcı profilini admin rolüyle oluştur
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: 'turalxaricde@xaricdeyasam.com',
          name: 'Tural Admin',
          role: 'admin'
        }
      ]);

    if (profileError) {
      throw profileError;
    }

    console.log('Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('Email:', 'turalxaricde@xaricdeyasam.com');
    console.log('Şifre:', 'resadxaricde');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Hata:', error.message);
    } else {
      console.error('Bilinmeyen hata:', error);
    }
  }
}

createAdmin(); 