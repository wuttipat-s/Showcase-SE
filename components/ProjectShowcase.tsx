'use client';

import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ExternalLink, FileText, Presentation, ChevronDown, Phone, Globe, User } from 'lucide-react';

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

    if (swiperRef.current?.autoplay?.running) {
      swiperRef.current.autoplay.stop();
    }

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

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
      <div className="flex h-screen w-full items-center justify-center bg-black text-white font-sans">
        <div className="text-center p-8 bg-neutral-900 rounded-3xl border border-neutral-800 max-w-sm">
          <p className="text-lg font-medium text-white mb-1">ยังไม่มีโปรเจกต์ในระบบ</p>
          <p className="text-neutral-400 text-sm font-light">เข้าใช้งานที่ /admin เพื่อเริ่มเพิ่มโปรเจกต์แรกของคุณ</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`h-screen w-full bg-black text-white font-sans overflow-hidden relative
        [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white
        [&_.swiper-pagination-bullet-active]:bg-[#2cffb5] [&_.swiper-pagination-bullet]:bg-white/40
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
              <section className="h-screen w-full snap-start relative flex flex-col justify-end p-6 md:p-16 overflow-hidden bg-black">
                
                {/* Fullscreen Image Background */}
                {project.logo_url && (
                  <>
                    <img
                      src={getImageUrl(project.logo_url)}
                      alt={project.title}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                  </>
                )}

                {/* Content at Bottom-Left Corner */}
                <div className="relative z-10 max-w-3xl text-left mb-10 md:mb-14">
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4 text-white leading-tight">
                    {project.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-neutral-300 font-normal leading-relaxed max-w-2xl">
                    {project.short_description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-neutral-400 z-10">
                  <span className="text-[10px] mb-1 tracking-widest uppercase font-medium">เลื่อนลงเพื่อดูรายละเอียด</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </section>

              {/* Section 2: Detailed Info, Links & Contact Frame (100vh) */}
              <section className="min-h-screen w-full snap-start flex flex-col items-center justify-center p-6 md:p-12 bg-black border-t border-neutral-900">
                <div className="max-w-4xl w-full bg-neutral-900/80 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-2xl backdrop-blur-md my-auto">
                  
                  {/* Title & Description */}
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4 border-b border-neutral-800 pb-4 tracking-tight flex items-center justify-between">
                    <span>รายละเอียดโปรเจกต์</span>
                    <span className="text-xs font-mono text-[#2cffb5] bg-[#2cffb5]/10 px-3 py-1 rounded-full border border-[#2cffb5]/30">
                      PROJECT DETAIL
                    </span>
                  </h2>
                  
                  <p className="text-neutral-300 leading-relaxed mb-6 whitespace-pre-line text-sm md:text-base font-light">
                    {project.full_description || project.short_description}
                  </p>

                  {/* External Link Action Buttons */}
                  <div className="flex flex-wrap gap-3 pb-6 border-b border-neutral-800">
                    {project.figma_url && (
                      <a
                        href={project.figma_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#2cffb5] text-black hover:bg-[#25e6a2] transition-all font-semibold text-xs md:text-sm shadow-md shadow-[#2cffb5]/10"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Figma File
                      </a>
                    )}
                    {project.doc_url && (
                      <a
                        href={project.doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700 transition-all font-medium text-xs md:text-sm"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#2cffb5]" /> เอกสารประกอบ
                      </a>
                    )}
                    {project.presentation_url && (
                      <a
                        href={project.presentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700 transition-all font-medium text-xs md:text-sm"
                      >
                        <Presentation className="w-3.5 h-3.5 text-[#2cffb5]" /> สไลด์นำเสนอ
                      </a>
                    )}
                  </div>

                  {/* Horizontal Contact & Developer Frame (#2cffb5) */}
                  <div className="mt-6 p-5 md:p-6 rounded-2xl border-2 border-[#2cffb5] bg-[#2cffb5]/5 backdrop-blur-sm text-neutral-200 shadow-[0_0_20px_rgba(44,255,181,0.08)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-800">
                      
                      {/* Left: Contact Info */}
                      <div className="flex flex-col gap-2.5 pr-0 md:pr-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#2cffb5] mb-1">
                          ข้อมูลการติดต่อ
                        </span>
                        <div className="flex items-center gap-2.5 text-xs md:text-sm text-neutral-300">
                          <Phone className="w-4 h-4 text-[#2cffb5] shrink-0" />
                          <span>เบอร์ : <strong className="text-white font-medium">054 466 666</strong></span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs md:text-sm text-neutral-300">
                          <span className="w-4 h-4 font-bold text-[#2cffb5] flex items-center justify-center shrink-0 text-xs">FB</span>
                          <span>FB : <strong className="text-white font-medium">วิศวกรรมซอฟต์แวร์ มหาวิทยาลัยพะเยา</strong></span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs md:text-sm text-neutral-300">
                          <Globe className="w-4 h-4 text-[#2cffb5] shrink-0" />
                          <span>Web : </span>
                          <a
                            href="https://ict.up.ac.th/home"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2cffb5] hover:underline font-medium truncate"
                          >
                            https://ict.up.ac.th/home
                          </a>
                        </div>
                      </div>

                      {/* Right: Developer Info */}
                      <div className="flex flex-col gap-2.5 pt-4 md:pt-0 pl-0 md:pl-6">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#2cffb5] mb-1">
                          ข้อมูลผู้จัดทำเว็บไซต์
                        </span>
                        <div className="flex items-start gap-2.5 text-xs md:text-sm text-neutral-300">
                          <User className="w-4 h-4 text-[#2cffb5] shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <p className="text-white font-medium">
                              68025494 นายวุฒิภัทร สัตตทิพย์พงศ์
                            </p>
                            <p className="text-neutral-400 text-xs">
                              คณะเทคโนโลยีสารสนเทศและการสื่อสาร สาขาวิศวกรรมซอฟต์แวร์
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
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