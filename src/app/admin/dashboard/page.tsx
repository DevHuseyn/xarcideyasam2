'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import sharp from 'sharp';

type Book = {
  id: number;
  title: string;
  author: string;
  cover_image: string;
  description: string;
  price: number;
  created_at: string;
};

type FeaturedBook = {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  price: number;
  features: string[];
  whatsapp_number: string;
  is_active: boolean;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [activeBookSection, setActiveBookSection] = useState('featured');
  const [books, setBooks] = useState<Book[]>([]);
  const [featuredBook, setFeaturedBook] = useState<FeaturedBook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    cover_image: '',
    description: '',
    price: 0,
    whatsapp_number: '+994504540738'
  });
  const [isEditingFeatured, setIsEditingFeatured] = useState(false);
  const [editedFeaturedBook, setEditedFeaturedBook] = useState<FeaturedBook | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    if (activeSection === 'books') {
      fetchBooks();
    }
    fetchFeaturedBook();
  }, [activeSection]);

  const checkAuth = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Session xətası:', error);
      router.push('/admin');
      return;
    }
    if (!session) {
      router.push('/admin');
      return;
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBooks(data || []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Kitaplar yüklənərkən xəta baş verdi');
    }
  };

  const fetchFeaturedBook = async () => {
    try {
      const { data, error } = await supabase
        .from('featured_books')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      // Varsayılan WhatsApp numarasını ekle
      const bookWithDefaultNumber = {
        ...data,
        whatsapp_number: data.whatsapp_number || '+994504540738'
      };
      
      setFeaturedBook(bookWithDefaultNumber);
      setEditedFeaturedBook(bookWithDefaultNumber);
    } catch (err) {
      console.error('Error fetching featured book:', err);
      setError('Öne çıkan kitap yüklenirken hata oluştu');
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Veri doğrulama
      if (!newBook.title.trim()) {
        throw new Error('Başlıq boş ola bilməz');
      }

      if (!newBook.author.trim()) {
        throw new Error('Müəllif adı boş ola bilməz');
      }

      if (!newBook.description.trim()) {
        throw new Error('Açıqlama boş ola bilməz');
      }

      if (!newBook.cover_image.trim()) {
        throw new Error('Üz qabığı şəkli URL\'i boş ola bilməz');
      }

      if (newBook.price <= 0) {
        throw new Error('Qiymət 0-dan böyük olmalıdır');
      }

      // Kitap verilerini hazırla
      const bookData = {
        title: newBook.title.trim(),
        author: newBook.author.trim(),
        description: newBook.description.trim(),
        cover_image: newBook.cover_image.trim(),
        price: newBook.price
      };

      console.log('Kitab məlumatları:', bookData);

      const { data, error: supabaseError } = await supabase
        .from('books')
        .insert([bookData])
        .select();

      if (supabaseError) {
        console.error('Supabase xətası:', supabaseError);
        throw new Error(`Veritabanı xətası: ${supabaseError.message}`);
      }

      if (!data) {
        throw new Error('Kitab əlavə edildi, lakin məlumatlar qaytarılmadı');
      }

      console.log('Əlavə edilən kitab:', data);

      // Başarılı olduğunda state'i güncelle
      setBooks([...(data || []), ...books]);
      setIsAddModalOpen(false);
      setNewBook({
        title: '',
        author: '',
        cover_image: '',
        description: '',
        price: 0,
        whatsapp_number: '+994504540738'
      });

    } catch (err) {
      console.error('Kitab əlavə edilərkən xəta:', err);
      setError(err instanceof Error ? err.message : 'Bilinməyən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!window.confirm('Bu kitabı silmək istədiyinizdən əminsiniz?')) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBooks(books.filter(book => book.id !== id));
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Kitap silinərkən xəta baş verdi');
    }
  };

  const handleEditFeaturedBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedFeaturedBook) return;

    try {
      // Veri doğrulama
      if (!editedFeaturedBook.title || !editedFeaturedBook.description || !editedFeaturedBook.cover_image) {
        setError('Lütfen tüm zorunlu alanları doldurun');
        return;
      }

      // WhatsApp numarası kontrolü
      const whatsappNumber = editedFeaturedBook.whatsapp_number || '+994504540738';

      const updateData = {
        title: editedFeaturedBook.title.trim(),
        description: editedFeaturedBook.description.trim(),
        cover_image: editedFeaturedBook.cover_image,
        price: editedFeaturedBook.price,
        features: editedFeaturedBook.features.map(f => f.trim()).filter(Boolean),
        whatsapp_number: whatsappNumber,
        is_active: true
      };

      console.log('Güncellenecek veri:', updateData);

      const { data, error } = await supabase
        .from('featured_books')
        .update(updateData)
        .eq('id', editedFeaturedBook.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase güncelleme hatası:', error);
        throw new Error(error.message);
      }

      console.log('Güncelleme başarılı:', data);
      
      setFeaturedBook(data);
      setEditedFeaturedBook(null);
      setIsEditingFeatured(false);
      setError(null);
    } catch (err) {
      console.error('Kitap güncellenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Kitap güncellenirken beklenmeyen bir hata oluştu');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Oturum bulunamadı');
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Şəkil yüklənərkən xəta baş verdi');
      }

      if (type === 'featured' && editedFeaturedBook) {
        setEditedFeaturedBook({ ...editedFeaturedBook, cover_image: data.url });
      } else if (type === 'new') {
        setNewBook({ ...newBook, cover_image: data.url });
      } else if (type === 'edit' && selectedBook) {
        setSelectedBook({ ...selectedBook, cover_image: data.url });
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Şəkil yüklənərkən xəta baş verdi');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: selectedBook.title.trim(),
          author: selectedBook.author.trim(),
          description: selectedBook.description.trim(),
          cover_image: selectedBook.cover_image.trim(),
          price: selectedBook.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBook.id);

      if (error) throw error;

      // Kitaplar listesini güncelle
      const updatedBooks = books.map(book => 
        book.id === selectedBook.id ? selectedBook : book
      );
      setBooks(updatedBooks);
      setIsEditModalOpen(false);
      setSelectedBook(null);
    } catch (err) {
      console.error('Error updating book:', err);
      setError('Kitap yenilənərkən xəta baş verdi');
    }
  };

  const renderBooksContent = () => {
    return (
      <div>
        {/* Alt Menü Butonları */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveBookSection('featured')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeBookSection === 'featured'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } transition-all duration-200 shadow-md`}
          >
            Ana Səhifədəki Kitab
          </button>
          <button
            onClick={() => setActiveBookSection('all')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeBookSection === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } transition-all duration-200 shadow-md`}
          >
            Bütün Kitablar
          </button>
        </div>

        {/* İçerik */}
        {activeBookSection === 'featured' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ana Səhifədəki Kitab
              </h2>
              {!isEditingFeatured && featuredBook && (
                <button
                  onClick={() => {
                    setEditedFeaturedBook(featuredBook);
                    setIsEditingFeatured(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
                >
                  Düzənlə
                </button>
              )}
            </div>

            {featuredBook ? (
              isEditingFeatured && editedFeaturedBook ? (
                <form onSubmit={handleEditFeaturedBook} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Başlıq
                        </label>
                        <input
                          type="text"
                          value={editedFeaturedBook.title}
                          onChange={(e) => setEditedFeaturedBook({
                            ...editedFeaturedBook,
                            title: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Üz qabığı şəkli
                        </label>
                        <div className="flex items-center space-x-4">
                          {editedFeaturedBook?.cover_image && (
                            <div className="relative h-40 w-32 rounded-lg overflow-hidden">
                              <Image
                                src={editedFeaturedBook.cover_image}
                                alt={editedFeaturedBook.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <label className="relative flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                              <span>{uploadingImage ? 'Yüklənir...' : 'Şəkil Seç'}</span>
                              <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => handleImageUpload(e, 'featured')}
                                disabled={uploadingImage}
                              />
                            </label>
                            <p className="mt-2 text-xs text-gray-500">JPG, PNG veya WEBP. Maksimum 5MB.</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Qiymət (AZN)
                        </label>
                        <input
                          type="number"
                          value={editedFeaturedBook.price || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setEditedFeaturedBook({
                              ...editedFeaturedBook,
                              price: value
                            });
                          }}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          WhatsApp Nömrəsi
                        </label>
                        <input
                          type="text"
                          value={editedFeaturedBook.whatsapp_number || ''}
                          onChange={(e) => setEditedFeaturedBook({ ...editedFeaturedBook, whatsapp_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+994501234567"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Açıqlama
                        </label>
                        <textarea
                          value={editedFeaturedBook.description}
                          onChange={(e) => setEditedFeaturedBook({
                            ...editedFeaturedBook,
                            description: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Özəlliklər (Hər sətirdə bir özəllik)
                        </label>
                        <textarea
                          value={editedFeaturedBook.features.join('\n')}
                          onChange={(e) => setEditedFeaturedBook({
                            ...editedFeaturedBook,
                            features: e.target.value.split('\n').filter(f => f.trim())
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={5}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingFeatured(false);
                        setEditedFeaturedBook(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
                    >
                      Ləğv et
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
                    >
                      Yadda saxla
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative h-64 rounded-lg overflow-hidden">
                    <Image
                      src={featuredBook.cover_image}
                      alt={featuredBook.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {featuredBook.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {featuredBook.description}
                    </p>
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {featuredBook.price} AZN
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      WhatsApp: {featuredBook.whatsapp_number}
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">Özəlliklər:</h5>
                      <ul className="space-y-1">
                        {featuredBook.features.map((feature, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-300 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                Ana səhifədə göstəriləcək kitab tapılmadı
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bütün Kitablar
              </h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
              >
                + Yeni Kitab
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="relative h-48">
                    <Image
                      src={book.cover_image}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {book.author}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      {book.description && book.description.length > 100
                        ? `${book.description.substring(0, 100)}...`
                        : book.description || ''}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {book.price} AZN
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'books':
        return renderBooksContent();
      case 'home':
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Xoş Gəldiniz!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Sol tərəfdəki menyudan istədiyiniz bölməni seçə bilərsiniz.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Xaricdə Yaşam
            </span>
          </h1>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col space-y-2 p-4">
          <button
            onClick={() => setActiveSection('home')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg ${
              activeSection === 'home'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200'
            } shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 w-full`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Ana Səhifə</span>
          </button>

          <button
            onClick={() => setActiveSection('books')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg ${
              activeSection === 'books'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200'
            } shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 w-full`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Kitablar</span>
          </button>

          <button
            onClick={() => router.push('/admin/orders')}
            className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Sifarişlər</span>
          </button>

          <button
            onClick={() => router.push('/admin/settings')}
            className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Tənzimləmələr</span>
          </button>
        </div>

        {/* Logout Button */}
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Çıxış</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-medium text-gray-800 dark:text-gray-200">
              Dashboard
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Yeni Kitab Əlavə Et
            </h2>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Başlıq
                </label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Müəllif
                </label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Üz qabığı şəkli
                </label>
                <div className="flex items-center space-x-4">
                  {newBook.cover_image && (
                    <div className="relative h-40 w-32 rounded-lg overflow-hidden">
                      <Image
                        src={newBook.cover_image}
                        alt="Kitap kapağı"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="relative flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      <span>{uploadingImage ? 'Yüklənir...' : 'Şəkil Seç'}</span>
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleImageUpload(e, 'new')}
                        disabled={uploadingImage}
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">JPG, PNG veya WEBP. Maksimum 5MB.</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıqlama
                </label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qiymət (AZN)
                </label>
                <input
                  type="number"
                  value={newBook.price || 0}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value);
                    setNewBook({ ...newBook, price: isNaN(price) ? 0 : price });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
                >
                  Əlavə et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Kitabı Redaktə Et
              </h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedBook(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Başlıq
                </label>
                <input
                  type="text"
                  value={selectedBook.title}
                  onChange={(e) => setSelectedBook({ ...selectedBook, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Müəllif
                </label>
                <input
                  type="text"
                  value={selectedBook.author}
                  onChange={(e) => setSelectedBook({ ...selectedBook, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Üz qabığı şəkli
                </label>
                <div className="flex items-center space-x-4">
                  {selectedBook.cover_image && (
                    <div className="relative h-40 w-32 rounded-lg overflow-hidden">
                      <Image
                        src={selectedBook.cover_image}
                        alt={selectedBook.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="relative flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      <span>{uploadingImage ? 'Yüklənir...' : 'Şəkil Seç'}</span>
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleImageUpload(e, 'edit')}
                        disabled={uploadingImage}
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">JPG, PNG veya WEBP. Maksimum 5MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıqlama
                </label>
                <textarea
                  value={selectedBook.description}
                  onChange={(e) => setSelectedBook({ ...selectedBook, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qiymət (AZN)
                </label>
                <input
                  type="number"
                  value={selectedBook?.price || 0}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value);
                    if (selectedBook) {
                      setSelectedBook({ ...selectedBook, price: isNaN(price) ? 0 : price });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedBook(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
                >
                  Yadda saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 