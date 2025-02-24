'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Görüntü optimizasyonu için boyutlar
const HERO_IMAGE_QUALITY = 75; // Hero görüntüsü için kalite
const BOOK_COVER_QUALITY = 85; // Kitap kapağı için kalite

// Animasyon varyantları
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Tip tanımlamaları
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

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [featuredBook, setFeaturedBook] = useState<FeaturedBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMounted(true);
    
    async function fetchFeaturedBook() {
      try {
        console.log('🔄 Kitap verisi çekiliyor...');
        
        const { data, error } = await supabase
          .from('featured_books')
          .select('*')
          .eq('is_active', true)
          .single();

        console.log('📊 Supabase Sorgusu:', {
          table: 'featured_books',
          filter: 'is_active = true'
        });

        if (error) {
          console.error('❌ Supabase hatası:', {
            code: error.code,
            message: error.message,
            details: error.details
          });
          throw error;
        }

        if (!data) {
          console.error('⚠️ Veri bulunamadı');
          throw new Error('Aktif kitap bulunamadı');
        }

        console.log('✅ Çekilen veri:', {
          id: data.id,
          title: data.title,
          price: data.price,
          features: data.features?.length || 0
        });
        
        setFeaturedBook(data);
      } catch (err) {
        console.error('🚨 Detaylı hata:', err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedBook();
    return () => setMounted(false);
  }, []);

  // Yükləmə komponenti
  const LoadingComponent = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="h-32 w-32 mx-auto">
            <div className="absolute inset-0 animate-pulse bg-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 animate-spin border-4 border-t-blue-500 border-blue-500/20 rounded-full"></div>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-white/80">Xaricde Yaşam</h1>
        <p className="text-gray-400">Yüklənir...</p>
      </div>
    </div>
  );

  if (!mounted) {
    return <LoadingComponent />;
  }

  // Book Section
  const BookSection = () => {
    if (loading || !featuredBook) {
      return (
        <section id="book" className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="h-32 w-32 mx-auto">
                    <div className="absolute inset-0 animate-pulse bg-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 animate-spin border-4 border-t-blue-500 border-blue-500/20 rounded-full"></div>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Kitab yüklənir...</h2>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section id="book" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Book Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[400px] mx-auto"
            >
              <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={featuredBook.cover_image}
                  alt={featuredBook.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  quality={BOOK_COVER_QUALITY}
                  loading="eager"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEBALkE6Oz5DRVlLT01RW2NhYGBtcW1+f5Hh4f/2wBDARUXFyAcIHxISHz4qIyk+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                {/* Yeni Butonu */}
                <motion.div
                  className="absolute top-4 right-4 z-10"
                  animate={{
                    y: [0, -5, 0],
                    rotateZ: [0, 5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-bold shadow-xl transform-gpu">
                      Yeni
                    </div>
                  </div>
                </motion.div>
                {/* Parlama Efekti */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                className="absolute -top-10 -left-10 z-10 w-20 h-20"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="w-20 h-20 rounded-full bg-primary-500/20 backdrop-blur-lg" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-10 -right-10 z-10 w-32 h-32"
                animate={{
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="w-32 h-32 rounded-full bg-secondary-500/20 backdrop-blur-lg" />
              </motion.div>
            </motion.div>

            {/* Book Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                Yeni Çıxdı
              </span>
              
              <h2 className="text-4xl font-bold gradient-text">
                {featuredBook.title}
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {featuredBook.description}
              </p>
              
              <ul className="space-y-4">
                {featuredBook.features.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3 text-gray-700 dark:text-gray-200"
                  >
                    <svg
                      className="w-5 h-5 text-primary-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="pt-6">
                <a
                  href={`https://wa.me/${(featuredBook.whatsapp_number || '+994504540738').replace(/[^0-9]/g, '')}?text=Salam, "${featuredBook.title}" kitabını almaq istəyirəm`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 group"
                >
                  <span>WhatsApp ilə Al - {featuredBook.price} AZN</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.967 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Airplane view"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-gray-900/70"></div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 right-20 opacity-30"
          animate={{
            y: [0, -20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13"></path>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
          </svg>
        </motion.div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-block relative">
                <h1 className="text-6xl md:text-8xl font-['Pacifico'] text-white mb-4">
                  Xaricde
                  <span className="text-primary-400">Yaşam</span>
                </h1>
                <motion.div
                  className="absolute -top-6 -right-6 w-12 h-12"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <svg className="w-full h-full text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Main Slogan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6 mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-medium text-white">
                Səyahət Blogu və Həyat Təcrübələrim
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Xarici ölkələrdəki macəralarımı, gündəlik həyatımı və səyahət təcrübələrimi
                sizinlə paylaşıram. Səyahət vlogları və fotoqrafiya ilə həyatın rəngarəng anlarını kəşf edək.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link 
                href="/books"
                className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Kitablarımız
              </Link>
              <button
                onClick={scrollToContact}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-primary-600 bg-white rounded-full hover:bg-gray-50 transition-colors duration-300"
              >
                <span>Əlaqə</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Book Section */}
      <BookSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-900 dark:to-secondary-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-white/10 text-white rounded-full">
              Tezliklə
            </span>
            <h2 className="text-4xl font-bold text-white mb-6">
              Xaricdə Yaşam Sosial Platforması
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Xaricdə yaşayan Azərbaycanlılar üçün xüsusi hazırlanmış sosial platforma. Təcrübələrinizi paylaşmaq və digər insanlarla əlaqə qurmaq üçün platformamıza qoşulun!
            </p>
            <div className="flex items-center justify-center gap-4">
              <div
                className="inline-flex items-center justify-center px-12 py-4 text-lg font-medium text-primary-600 bg-white/80 rounded-full cursor-not-allowed opacity-80"
              >
                <span>Tezliklə!</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* YouTube Videos Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Video Məzmunlarımız</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Xaricdə yaşam təcrübələri və faydalı məlumatlar haqqında video paylaşımlarımız</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Əsas Video */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              <div className="relative pb-[56.25%] h-0">
                <iframe 
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/GKa55RZ76u0?si=dYPmMbPh3i1eV17d"
                  title="YouTube video player"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Bakuriani'yə Getdim🤩</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Gürcüstanın gözəl dağ qəsəbəsi Bakuriani'də gəzinti və təəssüratlarımız haqqında video
                </p>
              </div>
            </div>

            {/* Sağ Panel - Yeni Videolar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Yeni Videolar
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <svg className="w-12 h-12 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">Yeni videolar tezliklə...</p>
                <a
                  href="https://www.youtube.com/@XaricdeYasam0"
          target="_blank"
          rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <span>Kanala abunə olun</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={contactRef} className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Sürətli Keçidlər */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6">Sürətli Keçidlər</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="hover:text-primary-400 transition-colors">
                    Haqqımızda
                  </Link>
                </li>
                <li>
                  <a href="https://www.youtube.com/@XaricdeYasam0" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                    Video Məzmunlarımız
                  </a>
                </li>
                <li className="flex items-center text-gray-400">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Bakı, Azərbaycan
                </li>
                <li className="flex items-center text-gray-400">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:xaricdeyasam@gmail.com" className="hover:text-primary-400 transition-colors">
                    xaricdeyasam@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Sosial Media */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Sosial Media</h3>
              <div className="flex flex-col space-y-4">
                <a href="https://instagram.com/xaricdeyasam" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>@xaricdeyasam</span>
                </a>
                <a href="https://instagram.com/nashir0v" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>@nashir0v</span>
                </a>
                <a href="https://youtube.com/@XaricdeYasam0" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>@XaricdeYasam0</span>
                </a>
                <a href="https://t.me/xariceyasam" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.041-.174-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span>@xariceyasam</span>
                </a>
                <a href="https://www.tiktok.com/@xaricdeyasam" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span>@xaricdeyasam</span>
                </a>
              </div>
            </div>
          </div>

          {/* Alt Footer */}
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2024 Xaricdə Ucuz Yaşam. Bütün hüquqlar qorunur.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
