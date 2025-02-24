'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Tip tanımlamaları
type Book = {
  id: number;
  title: string;
  author: string;
  cover_image: string;
  description: string;
  price: number;
  whatsapp_number: string;
};

// Animasyon varyantları
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const waveVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          throw error;
        }

        setBooks(data || []);
      } catch (err) {
        console.error('Kitapları yüklərkən xəta baş verdi:', err);
        setError('Kitapları yüklərkən xəta baş verdi. Zəhmət olmasa səhifəni yeniləyin.');
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  // Yükleme durumu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-32 w-32 mx-auto">
              <div className="absolute inset-0 animate-pulse bg-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 animate-spin border-4 border-t-blue-500 border-blue-500/20 rounded-full"></div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Kitablar yüklənir...</h2>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4 p-8">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Xəta baş verdi</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yenidən cəhd edin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Arkaplan Dalgaları */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M0,50 C30,60 70,40 100,50 L100,100 L0,100 Z"
              fill="currentColor"
              className="text-blue-200 dark:text-blue-700"
              animate={{
                d: [
                  "M0,50 C30,60 70,40 100,50 L100,100 L0,100 Z",
                  "M0,50 C30,40 70,60 100,50 L100,100 L0,100 Z",
                ],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 4,
              }}
            />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto text-center mb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative inline-block"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-4">
            Kitablarımız
          </h1>
          <motion.div
            className="absolute -top-6 -right-6 w-12 h-12 text-blue-500 dark:text-blue-400"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300 mt-6"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          Xaricdə yaşam təcrübələri və məlumatlar
        </motion.p>
      </div>

      {/* Kitaplar Grid */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <motion.div
            key={book.id}
            className="group relative h-[600px]"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 * book.id }}
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform-gpu transition-all duration-300 group-hover:shadow-2xl dark:shadow-blue-500/20 h-full flex flex-col">
              {/* 3D Efekt Kenarları */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              <div className="relative h-72">
                <Image
                  src={book.cover_image}
                  alt={book.title}
                  fill
                  className="object-contain object-center"
                  quality={85}
                />
                {/* Parlama Efekti */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="relative p-8 flex flex-col flex-grow">
                <div className="absolute -top-8 right-8 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                  {book.price} AZN
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">
                  {book.author}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow line-clamp-3">
                  {book.description}
                </p>
                <a
                  href={`https://wa.me/${(book.whatsapp_number || '+994504540738').replace(/[^0-9]/g, '')}?text=Salam, "${book.title}" kitabını almaq istəyirəm`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform group-hover:-translate-y-1 mt-auto"
                >
                  <span>WhatsApp ilə Al - {book.price} AZN</span>
                  <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.967 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alt Dalga */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-24 z-0"
        variants={waveVariants}
        animate="animate"
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M0,70 C30,85 70,85 100,70 L100,100 L0,100 Z"
            fill="currentColor"
            className="text-blue-100 dark:text-blue-900/30"
          />
        </svg>
      </motion.div>
    </div>
  );
} 