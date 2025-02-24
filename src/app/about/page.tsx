'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 dark:from-primary/50 dark:to-secondary/50 opacity-60" />
        <Image
          src="/images/about.jpg"
          alt="Beautiful Beach Sunset"
          fill
          sizes="100vw"
          quality={85}
          className="object-cover object-center"
          priority
          loading="eager"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEBALkE6Oz5DRVlLT01RW2NhYGBtcW1+f5Hh4f/2wBDARUXFyAcIHxISHz4qIyk+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          style={{ zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-black opacity-20 dark:opacity-40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white max-w-4xl mx-auto px-4 z-10"
          >
            <h1 className="text-4xl md:text-6xl font-['Pacifico'] mb-6 text-shadow-lg">
              Xaricde Yaşam
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-16">
          {/* <h1 className="text-2xl font-['Pacifico']">Xaricde Yaşam</h1> */}
          {/* <nav>
            <a href="#about" className="text-gray-800 hover:text-primary transition">Haqqımda</a>
          </nav> */}
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative">
            <div className="blob bg-primary/20 dark:bg-primary/10 absolute inset-0 z-0"></div>
            <div className="blob bg-secondary/20 dark:bg-secondary/10 absolute -top-8 -right-8 w-32 h-32 z-0"></div>
            <Image
              src="/images/profile.jpg"
              alt="Profile"
              width={600}
              height={400}
              className="relative z-10 rounded-3xl w-full object-cover shadow-lg dark:shadow-2xl"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Xaricde Yaşam'a Xoş Gəldiniz!</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Salam, mən Xaricde Yaşamın yaradıcısıyam. İndiyə qədər Gürcüstan, Misir və Dubay kimi unudulmaz məkanlarda səyahət edərək, hər biri özünəməxsus mədəniyyəti, tarixi və həyat tərzi ilə mənə ilham verən təcrübələr yaşadım. Bu səyahətlər, dünyanın təqdim etdiyi gözəllikləri kəşf etməyin nə qədər möhtəşəm olduğunu xatırlatdı.
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Instagram səhifələrimizdə – <Link href="https://instagram.com/xaricdeyasam" className="text-primary hover:underline">@xaricdeyasam</Link> və <Link href="https://instagram.com/nashir0v" className="text-primary hover:underline">@nashir0v</Link> – ziyarət etdiyim şəhərlərdən, yerli ləzzətlərdən və anın ecazkar görüntülərindən parçalar tapa bilərsiniz. Youtube kanalımızda isə <Link href="https://youtube.com/@xaricdeyasam0?si=omfqVFni8Fb9GeD_" className="text-primary hover:underline">XaricdeYasam0</Link> vasitəsilə səyahət vloglarımı və macəralarımın pərdə arxasını sizlərlə paylaşırıq. Xüsusilə bu videoda, sərhədsiz səyahət ruhunun necə yaşandığını hiss edə bilərsiniz.
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Amma bu yalnız başlanğıcdır! Daha çox yerləri kəşf etmək, yeni mədəniyyətlərlə tanış olmaq və həyatın təqdim etdiyi bənzərsiz təcrübələri sizinlə bölüşmək üçün yola çıxmağa hazıram. Hər səyahət, həyatı fərqli bir pəncərədən görmək və ilham dolu xatirələr yaratmaq deməkdir.
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Əgər siz də macəra dolu bir həyatın izini sürmək, yeni yerləri kəşf etmək və ilham almaq istəyirsinizsə, doğru yerdəsiniz. Gəlin, birlikdə dünyanı kəşf edək, sərhədləri aşaq və həyatın hər anını doyasıya yaşayaq!
            </p>

            <div className="flex gap-4 mt-8">
              <Link
                href="https://instagram.com/xaricdeyasam"
                className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-110 transition duration-300 dark:shadow-purple-500/20"
              >
                <i className="ri-instagram-line text-2xl"></i>
              </Link>
              <Link
                href="https://instagram.com/nashir0v"
                className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transform hover:scale-110 transition duration-300 dark:shadow-blue-500/20"
              >
                <i className="ri-instagram-line text-2xl"></i>
              </Link>
              <Link
                href="https://youtube.com/@xaricdeyasam0?si=omfqVFni8Fb9GeD_"
                className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transform hover:scale-110 transition duration-300 dark:shadow-red-500/20"
              >
                <i className="ri-youtube-line text-2xl"></i>
              </Link>
              <Link
                href="https://t.me/xariceyasam"
                className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-lg hover:shadow-lg transform hover:scale-110 transition duration-300 dark:shadow-blue-500/20"
              >
                <i className="ri-telegram-line text-2xl"></i>
              </Link>
              <Link
                href="https://www.tiktok.com/@xaricdeyasam"
                className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-gray-800 to-black text-white rounded-lg hover:shadow-lg transform hover:scale-110 transition duration-300 dark:shadow-gray-800/20"
              >
                <i className="ri-tiktok-line text-2xl"></i>
              </Link>
            </div>
          </div>
        </main>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow dark:shadow-blue-500/5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <i className="ri-map-pin-line text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Səyahət</h3>
            <p className="text-gray-600 dark:text-gray-300">Dünyanın müxtəlif guşələrindən unudulmaz təcrübələr və xatirələr.</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow dark:shadow-purple-500/5">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <i className="ri-camera-line text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Fotoqrafiya</h3>
            <p className="text-gray-600 dark:text-gray-300">Hər anı əbədiləşdirən professional çəkilişlər və videolar.</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow dark:shadow-green-500/5">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <i className="ri-earth-line text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Mədəniyyət</h3>
            <p className="text-gray-600 dark:text-gray-300">Fərqli mədəniyyətləri kəşf edərək dünyaya yeni baxış.</p>
          </div>
        </section>
      </div>
    </div>
  );
} 
 