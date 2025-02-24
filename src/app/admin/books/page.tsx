'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

type Book = {
  id: number;
  title: string;
  author: string;
  cover_image: string;
  description: string;
  price: number;
  whatsapp_number: string;
  display_order: number;
  created_at: string;
};

export default function BooksManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    cover_image: '',
    description: '',
    price: 0,
    whatsapp_number: '+994504540738'
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchBooks();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin');
    }
  };

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      setBooks(data || []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Kitaplar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const maxOrder = Math.max(...books.map(book => book.display_order || 0), 0);
      
      const bookData = {
        ...newBook,
        display_order: maxOrder + 1
      };

      const { data, error } = await supabase
        .from('books')
        .insert([bookData])
        .select();

      if (error) throw error;

      const updatedBooks = [...books, ...(data || [])].sort((a, b) => a.display_order - b.display_order);
      setBooks(updatedBooks);
      
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
      console.error('Error adding book:', err);
      setError('Kitap əlavə edilərkən xəta baş verdi');
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

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    if (!selectedBook) {
      setError('Kitap bilgileri bulunamadı');
      setSaving(false);
      return;
    }

    if (!selectedBook.title.trim()) {
      setError('Başlıq boş olamaz');
      setSaving(false);
      return;
    }

    if (!selectedBook.author.trim()) {
      setError('Müəllif adı boş olamaz');
      setSaving(false);
      return;
    }

    if (!selectedBook.description.trim()) {
      setError('Açıqlama boş olamaz');
      setSaving(false);
      return;
    }

    if (selectedBook.description.length > 130) {
      setError('Açıqlama 130 simvoldan çox ola bilməz');
      setSaving(false);
      return;
    }

    if (!selectedBook.cover_image.trim()) {
      setError('Üz qabığı şəkli URL\'i boş olamaz');
      setSaving(false);
      return;
    }

    if (selectedBook.price <= 0) {
      setError('Qiymət 0-dan böyük olmalıdır');
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: selectedBook.title.trim(),
          author: selectedBook.author.trim(),
          description: selectedBook.description.trim(),
          cover_image: selectedBook.cover_image.trim(),
          price: selectedBook.price,
          whatsapp_number: selectedBook.whatsapp_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBook.id);

      if (error) throw error;

      setSuccessMessage('Kitap uğurla yeniləndi');
      
      await fetchBooks();

      setTimeout(() => {
        setIsEditModalOpen(false);
        setSelectedBook(null);
        setSuccessMessage(null);
      }, 2000);

    } catch (err) {
      console.error('Error updating book:', err);
      setError('Kitap yenilənərkən xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'edit' | 'add') => {
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

      if (type === 'edit' && selectedBook) {
        setSelectedBook({ ...selectedBook, cover_image: data.url });
      } else {
        setNewBook({ ...newBook, cover_image: data.url });
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Şəkil yüklənərkən xəta baş verdi');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleReorder = async (bookId: number, direction: 'up' | 'down') => {
    const currentIndex = books.findIndex(book => book.id === bookId);
    if (currentIndex === -1) return;

    const newBooks = [...books];
    const currentBook = newBooks[currentIndex];
    let otherBook;

    if (direction === 'up' && currentIndex > 0) {
      otherBook = newBooks[currentIndex - 1];
    } else if (direction === 'down' && currentIndex < newBooks.length - 1) {
      otherBook = newBooks[currentIndex + 1];
    } else {
      return;
    }

    const tempOrder = currentBook.display_order;
    currentBook.display_order = otherBook.display_order;
    otherBook.display_order = tempOrder;

    try {
      const { error } = await supabase
        .from('books')
        .upsert([
          { id: currentBook.id, display_order: currentBook.display_order },
          { id: otherBook.id, display_order: otherBook.display_order }
        ]);

      if (error) throw error;

      setBooks([...newBooks].sort((a, b) => a.display_order - b.display_order));
    } catch (err) {
      console.error('Error reordering books:', err);
      setError('Kitapların sırası dəyişdirilərkən xəta baş verdi');
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Kitablar
            </h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Yeni Kitab
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Books Grid */}
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
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                  #{book.display_order}
                </div>
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReorder(book.id, 'up')}
                      disabled={books.indexOf(book) === 0}
                      className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Yuxarı daşı"
                    >
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleReorder(book.id, 'down')}
                      disabled={books.indexOf(book) === books.length - 1}
                      className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Aşağı daşı"
                    >
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>
                    <button
                      onClick={() => {
                        setSelectedBook(book);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Redaktə et"
                    >
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

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
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {successMessage}
              </div>
            )}

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
                  <div className="relative h-40 w-32 rounded-lg overflow-hidden">
                    <Image
                      src={selectedBook.cover_image}
                      alt={selectedBook.title}
                      fill
                      className="object-cover"
                    />
                  </div>
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
                  onKeyDown={(e) => {
                    if (selectedBook.description.length >= 130 && 
                        e.key !== 'Backspace' && 
                        e.key !== 'Delete' && 
                        !e.metaKey && 
                        !e.ctrlKey) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const text = e.target.value;
                    if (text.length <= 130) {
                      setSelectedBook({ ...selectedBook, description: text });
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text');
                    const remainingChars = 130 - selectedBook.description.length;
                    if (text.length > 0 && remainingChars > 0) {
                      const truncatedText = text.slice(0, remainingChars);
                      setSelectedBook({ 
                        ...selectedBook, 
                        description: selectedBook.description + truncatedText 
                      });
                    }
                  }}
                  className={`w-full px-3 py-2 border ${
                    selectedBook.description.length >= 130 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  } rounded-md focus:outline-none focus:ring-2`}
                  rows={5}
                  maxLength={130}
                  required
                />
                <p className={`mt-1 text-sm ${selectedBook.description.length >= 130 ? 'text-red-500' : 'text-gray-500'}`}>
                  {selectedBook.description.length}/130 simvol (Kitab kartına görə maksimum limit)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qiymət (AZN)
                </label>
                <input
                  type="number"
                  value={selectedBook.price || 0}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value);
                    setSelectedBook({ ...selectedBook, price: isNaN(price) ? 0 : price });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  WhatsApp Nömrəsi
                </label>
                <input
                  type="text"
                  value={selectedBook.whatsapp_number}
                  onChange={(e) => setSelectedBook({ ...selectedBook, whatsapp_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+994501234567"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedBook(null);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Yadda saxlanılır...' : 'Yadda saxla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                        onChange={(e) => handleImageUpload(e, 'add')}
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
                  onKeyDown={(e) => {
                    if (newBook.description.length >= 130 && 
                        e.key !== 'Backspace' && 
                        e.key !== 'Delete' && 
                        !e.metaKey && 
                        !e.ctrlKey) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const text = e.target.value;
                    if (text.length <= 130) {
                      setNewBook({ ...newBook, description: text });
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text');
                    const remainingChars = 130 - newBook.description.length;
                    if (text.length > 0 && remainingChars > 0) {
                      const truncatedText = text.slice(0, remainingChars);
                      setNewBook({ 
                        ...newBook, 
                        description: newBook.description + truncatedText 
                      });
                    }
                  }}
                  className={`w-full px-3 py-2 border ${
                    newBook.description.length >= 130 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  } rounded-md focus:outline-none focus:ring-2`}
                  rows={3}
                  maxLength={130}
                  required
                />
                <p className={`mt-1 text-sm ${newBook.description.length >= 130 ? 'text-red-500' : 'text-gray-500'}`}>
                  {newBook.description.length}/130 simvol (Kitab kartına görə maksimum limit)
                </p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  WhatsApp Nömrəsi
                </label>
                <input
                  type="text"
                  value={newBook.whatsapp_number}
                  onChange={(e) => setNewBook({ ...newBook, whatsapp_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+994501234567"
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
    </div>
  );
} 