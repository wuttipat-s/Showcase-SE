'use client';

import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ExternalLink, FileText, Presentation, ChevronDown } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export interface Project {
  id: string;
  title: string;
  short_description: string;
  full_description: string;
  logo_url: string;
  figma_url?: string;
  doc_url?: string;
  presentation_url?: string;
  display_order?: number;
}

interface ProjectShowcaseProps {
  projects: Project[];
}

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
    const match = url.match(/(?:file\/d\/|id=|d\/)([a-zA-Z0-9_-]{25,})/);
    const fileId = match ? match[1] : null;
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000` : url;
  }
  return url;
};

export default function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const swiperRef = useRef<SwiperClass | null>(null);

  // ตรวจจับการขยับเมาส์: หยุด Autoplay ขณะขยับ และเริ่มใหม่เมื่อเมาส์หยุดนิ่ง
  const handleMouseMove = () => {
    setIsIdle(false);

    // หยุด Autoplay ทันทีที่เมาส์มีการขยับ
    if (swiperRef.current?.autoplay?.running) {
      swiperRef.current.autoplay.stop();
    }

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // เมื่อเมาส์หยุดขยับเกิน 2.5 วินาที ให้ Autoplay ทำงานต่อ
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      if (swiperRef.current?.autoplay && !swiperRef.current.autoplay.running) {
        swiperRef.current.autoplay.start();
      }
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  if (!projects || projects.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white text-neutral-900">
        <div className="text-center p-8 bg-neutral-50 rounded-3xl border border-neutral-200/80 max-w-sm">
          <p className="text-lg font-medium text-neutral-900 mb-1">ยังไม่มีโปรเจกต์ในระบบ</p>
          <p className="text-neutral-500 text-sm">เข้าใช้งานที่ /admin เพื่อเริ่มเพิ่มโปรเจกต์แรกของคุณ</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`h-screen w-full bg-black text-neutral-900 overflow-hidden relative
        [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white
        [&_.swiper-pagination-bullet-active]:bg-white [&_.swiper-pagination-bullet]:bg-white/50
        [&_.swiper-button-next]:transition-opacity [&_.swiper-button-prev]:transition-opacity [&_.swiper-pagination]:transition-opacity
        [&_.swiper-button-next]:duration-500 [&_.swiper-button-prev]:duration-500 [&_.swiper-pagination]:duration-500
        ${isIdle ? '[&_.swiper-button-next]:opacity-0 [&_.swiper-button-prev]:opacity-0 [&_.swiper-pagination]:opacity-0' : '[&_.swiper-button-next]:opacity-100 [&_.swiper-button-prev]:opacity-100 [&_.swiper-pagination]:opacity-100'}`}
    >
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={0}
        slidesPerView={1}
        loop={projects.length > 1}
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="h-full w-full"
      >
        {projects.map((project) => (
          <SwiperSlide key={project.id}>
            {/* Vertical Scroll Snap Container */}
            <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
              
              {/* Section 1: Hero / Fullscreen Image with Bottom-Left Text (100vh) */}
              <section className="h-screen w-full snap-start relative flex flex-col justify-end p-6 md:p-16 overflow-hidden bg-neutral-950">
                
                {/* Fullscreen Image Background */}
                {project.logo_url && (
                  <>
                    <img
                      src={getImageUrl(project.logo_url)}
                      alt={project.title}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </>
                )}

                {/* Content at Bottom-Left Corner */}
                <div className="relative z-10 max-w-3xl text-left mb-10 md:mb-14">
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 text-white drop-shadow-lg leading-tight">
                    {project.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-neutral-200 font-medium leading-relaxed drop-shadow-md max-w-2xl">
                    {project.short_description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-white/80 z-10">
                  <span className="text-[10px] mb-1 tracking-widest uppercase font-semibold drop-shadow">เลื่อนลงเพื่อดูรายละเอียด</span>
                  <ChevronDown className="w-4 h-4 drop-shadow" />
                </div>
              </section>

              {/* Section 2: Detailed Info & External Links (100vh) */}
              <section className="h-screen w-full snap-start flex flex-col items-center justify-center p-6 md:p-12 bg-neutral-50/90 border-t border-neutral-200">
                <div className="max-w-3xl w-full bg-white border border-neutral-200/80 p-8 md:p-10 rounded-3xl shadow-sm">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 mb-4 border-b border-neutral-100 pb-4">
                    รายละเอียดโปรเจกต์
                  </h2>
                  <p className="text-neutral-600 leading-relaxed mb-8 whitespace-pre-line text-sm md:text-base font-normal">
                    {project.full_description || project.short_description}
                  </p>

                  {/* External Link Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-neutral-100">
                    {project.figma_url && (
                      <a
                        href={project.figma_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-all font-medium text-xs md:text-sm shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Figma File
                      </a>
                    )}
                    {project.doc_url && (
                      <a
                        href={project.doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-200/80 transition-all font-medium text-xs md:text-sm"
                      >
                        <FileText className="w-3.5 h-3.5 text-neutral-600" /> เอกสารประกอบ
                      </a>
                    )}
                    {project.presentation_url && (
                      <a
                        href={project.presentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-200/80 transition-all font-medium text-xs md:text-sm"
                      >
                        <Presentation className="w-3.5 h-3.5 text-neutral-600" /> สไลด์นำเสนอ
                      </a>
                    )}
                  </div>
                </div>
              </section>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}