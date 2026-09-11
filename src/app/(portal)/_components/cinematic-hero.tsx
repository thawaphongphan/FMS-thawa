"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import NextImage from "next/image";
import {
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  X,
  Check,
  Copy,
  Newspaper,
  BookOpen,
  Eye,
  Compass,
  Globe2,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";

interface CinematicHeroProps {
  stats?: {
    students?: string;
    departments?: string;
    employmentRate?: string;
    publications?: string;
  };
}

export function CinematicHero({ stats }: CinematicHeroProps) {
  const t = useT();
  const heroRef = useRef<HTMLElement>(null);

  // Visual options: "isolated-monk" (transparent PNG), "monk-look-left" (lotus pond transparent), "full-monk" (classic full background)
  const [visualMode, setVisualMode] = useState<"isolated-monk" | "monk-look-left" | "full-monk">("isolated-monk");
  const [headlineMode, setHeadlineMode] = useState<"dharma" | "dhammaduta">("dharma");
  const [showTechInfo, setShowTechInfo] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [isGazeTracking, setIsGazeTracking] = useState(true);

  // Mouse Gaze Coordinates: normalized from -1 (left/top) to +1 (right/bottom)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const targetPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Smooth lerp loop for lifelike head/eye tracking
  useEffect(() => {
    if (!isGazeTracking) return;

    const updatePhysics = () => {
      const ease = 0.08;
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * ease;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * ease;

      setMousePos({
        x: Number(currentPosRef.current.x.toFixed(4)),
        y: Number(currentPosRef.current.y.toFixed(4)),
      });

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isGazeTracking]);

  const effectiveMousePos = isGazeTracking ? mousePos : { x: 0, y: 0 };

  // Mouse movement on hero section
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement> | MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawX = (e.clientX - centerX) / (rect.width / 2);
    const rawY = (e.clientY - centerY) / (rect.height / 2);

    targetPosRef.current = {
      x: Math.max(-1, Math.min(1, rawX)),
      y: Math.max(-1, Math.min(1, rawY)),
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Return to looking slightly towards the content on the left (-0.25)
    targetPosRef.current = { x: -0.25, y: 0 };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("ลงทะเบียนรับคู่มือหลักสูตรพระธรรมทูตและข่าวสารเรียบร้อยแล้ว อนุโมทนาสาธุครับ!");
    setEmail("");
  };

  const dhammaNetwork = [
    "DHAMMADUTA COLLEGE",
    "MAHACHULALONGKORNRAJAVIDYALAYA",
    "WORLD BUDDHIST UNIVERSITY",
    "INTERNATIONAL MEDITATION NETWORK",
    "OXFORD BUDDHIST STUDIES",
    "GLOBAL PEACE SUMMIT",
    "UNESCO PARTNERSHIP",
    "ASIAN BUDDHIST CONGRESS",
  ];

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-[#061325] text-white select-none border-b border-[#1E3E62]/50"
      style={{ perspective: "1200px" }}
    >
      {/* Styles for Bebas Neue, JetBrains Mono & Dhammaduta Glass */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sarabun:wght@400;500;600;700&display=swap');

        .font-bebas {
          font-family: 'Bebas Neue', Impact, sans-serif;
        }

        .font-mono-tech {
          font-family: 'JetBrains Mono', monospace;
        }

        .liquid-glass-dhammaduta {
          background: rgba(14, 34, 61, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(56, 189, 248, 0.25);
          box-shadow: 0 8px 32px 0 rgba(2, 10, 25, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15);
        }

        .liquid-glass-dhammaduta-strong {
          background: rgba(6, 19, 37, 0.75);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1px solid rgba(56, 189, 248, 0.28);
          box-shadow: 0 12px 36px 0 rgba(2, 8, 20, 0.75);
        }

        @keyframes marquee-dhammaduta {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee-dhamma {
          display: flex;
          width: 200%;
          animation: marquee-dhammaduta 26s linear infinite;
        }

        .animate-marquee-dhamma:hover {
          animation-play-state: paused;
        }

        @keyframes celestial-halo-pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1.0);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.08);
          }
        }

        .animate-halo-pulse {
          animation: celestial-halo-pulse 6s ease-in-out infinite alternate;
        }
      `,
        }}
      />

      {/* 1. 100% STATIC BACKGROUND (อยู่นิ่งสนิท ไม่เอียง ไม่ขยับตามเมาส์) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#0A1E3F] via-[#081830] to-[#040C1A]">
        {/* Static Celestial Glow Behind Right Column */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px] animate-halo-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[90px] animate-halo-pulse [animation-delay:2s] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[110px] pointer-events-none" />

        {/* Dynamic Soft Cursor Light Aura */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(550px circle at ${(effectiveMousePos.x + 1) * 50}% ${(effectiveMousePos.y + 1) * 50}%, rgba(56, 189, 248, 0.08), transparent 70%)`,
          }}
        />

        {/* Bottom Fade to blend seamlessly with Portal light/dark background */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Interactive Controls Bar */}
      <div className="relative z-20 w-full border-b border-cyan-500/20 bg-[#061325]/85 backdrop-blur-md px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-300 font-bold flex items-center gap-1.5 text-[11px] font-mono-tech">
            <Compass className="h-3.5 w-3.5 text-cyan-400" />
            <span>DHAMMADUTA BLUE // ธรรมทูตโมเดล</span>
          </span>
          <span className="text-cyan-500/30 hidden sm:inline">|</span>
          <span className="text-amber-300/90 text-[11px] font-mono-tech hidden sm:inline flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>พื้นหลังนิ่ง 100% • พระสงฆ์หันมองตามเมาส์</span>
          </span>
        </div>

        {/* Switchers & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Gaze Mouse-Tracking Indicator & Toggle */}
          <button
            type="button"
            onClick={() => setIsGazeTracking(!isGazeTracking)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono-tech transition-all border ${
              isGazeTracking
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-xs"
                : "bg-white/5 text-white/50 border-white/10"
            }`}
            title="คลิกเพื่อเปิด/ปิดระบบสายตาและศีรษะหันมองตามเมาส์"
          >
            <Eye className="h-3.5 w-3.5 animate-pulse" />
            <span>
              {isGazeTracking
                ? `มองตามเมาส์ (${(mousePos.x > 0 ? "+" : "") + mousePos.x.toFixed(2)}, ${(mousePos.y > 0 ? "+" : "") + mousePos.y.toFixed(2)})`
                : "เปิดระบบมองตามเมาส์"}
            </span>
          </button>

          {/* Visual Selector */}
          <div className="inline-flex rounded-full bg-white/10 p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setVisualMode("isolated-monk")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                visualMode === "isolated-monk"
                  ? "bg-cyan-500 text-black shadow-sm font-bold"
                  : "text-white/75 hover:text-white"
              }`}
            >
              <span>พระสงฆ์ไทย (ไดคัทมองตามเมาส์)</span>
            </button>
            <button
              type="button"
              onClick={() => setVisualMode("monk-look-left")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                visualMode === "monk-look-left"
                  ? "bg-cyan-500 text-black shadow-sm font-bold"
                  : "text-white/75 hover:text-white"
              }`}
            >
              <span>สมาธิบงกช (หันมองซ้าย)</span>
            </button>
            <button
              type="button"
              onClick={() => setVisualMode("full-monk")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                visualMode === "full-monk"
                  ? "bg-cyan-500 text-black shadow-sm font-bold"
                  : "text-white/75 hover:text-white"
              }`}
            >
              <span>ภาพผืนเดิม</span>
            </button>
          </div>

          {/* Headline Text Switcher */}
          <div className="hidden md:inline-flex rounded-full bg-white/10 p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setHeadlineMode("dharma")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                headlineMode === "dharma"
                  ? "bg-amber-400 text-black font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              NEW DHARMA
            </button>
            <button
              type="button"
              onClick={() => setHeadlineMode("dhammaduta")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                headlineMode === "dhammaduta"
                  ? "bg-amber-400 text-black font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              DHAMMADUTA
            </button>
          </div>

          {/* Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowTechInfo(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 border border-cyan-400/30 transition-all hover:scale-105"
            title="เจาะลึกอัตลักษณ์วิทยาลัยพระธรรมทูตและระบบโมชันสายตามองตามเมาส์"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>💡 อัตลักษณ์ธรรมทูต</span>
          </button>
        </div>
      </div>

      {/* 3. HERO CONTENT: SPLIT-SCREEN LAYOUT (ข้อความอยู่ซ้าย, พระอยู่ขวาหันมองข้อความ) */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-14 md:pt-12 md:pb-16 flex flex-col justify-between min-h-[640px] lg:min-h-[720px]">
        {/* Top Taglines Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-mono-tech uppercase tracking-wider text-cyan-100 mb-6">
          <div className="flex items-center gap-2 bg-[#061325]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30 shadow-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>DHAMMADUTA COLLEGE {"//"} AY 2026</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-[#061325]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30 shadow-sm">
            <span className="text-amber-300">●</span>
            <span>{"//"} GLOBAL DHAMMA MISSION</span>
            <span className="text-cyan-500/40">•</span>
            <span>ADMISSIONS OPEN</span>
          </div>
          <div className="flex items-center gap-1 bg-[#061325]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30 shadow-sm">
            <span>{"//"} STILLNESS WITHIN, WISDOM BEYOND</span>
          </div>
        </div>

        {/* Main Grid: Left Column (Text) & Right Column (Interactive Monk) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          {/* LEFT COLUMN (60% on desktop): Content, Headline, Search, and CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            {/* Subtle Watermark Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#061325]/85 backdrop-blur-md text-cyan-200 text-xs font-mono-tech border border-cyan-400/30 mb-3 shadow-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>THE GLOBAL BUDDHIST LEADERSHIP ACADEMY</span>
            </div>

            {/* Huge Bebas Neue Headline (นิ่งสนิท 100% ไม่อ่อนไหวตามเมาส์) */}
            <h1 className="font-bebas text-6xl sm:text-8xl md:text-9xl lg:text-[7.8rem] tracking-tight leading-[0.88] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)] uppercase">
              {headlineMode === "dharma" ? (
                <>
                  NEW DHARMA <br />
                  <span className="text-cyan-400">ERA</span>
                </>
              ) : (
                <>
                  DHAMMADUTA <br />
                  <span className="text-amber-400">DIGITAL</span>
                </>
              )}
            </h1>

            {/* Monospace Captions Box */}
            <div className="mt-5 max-w-xl w-full flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-tech text-xs text-cyan-100 leading-relaxed bg-[#061325]/85 backdrop-blur-md p-4 rounded-xl border border-cyan-500/25 shadow-xl">
              <p className="text-left sm:w-1/2">
                <strong className="text-amber-300 font-bold block mb-0.5">
                  {"//"} วิทยาลัยพระธรรมทูต
                </strong>
                บ่มเพาะพระธรรมทูตและพุทธศาสนิกชนด้วยปัญญาญาณและเทคโนโลยีดิจิทัลสู่สากล.
              </p>
              <p className="text-left sm:w-1/2 sm:border-l sm:border-cyan-500/20 sm:pl-4">
                <strong className="text-cyan-300 font-bold block mb-0.5">
                  {"//"} สมาธิ ปัญญา นวัตกรรม
                </strong>
                จิตภาวนาที่สงบนิ่ง ผสานนวัตกรรมเพื่อสร้างสรรค์สันติภาพแก่มวลมนุษยชาติ.
              </p>
            </div>

            {/* Email Search / Subscription Box */}
            <div className="mt-6 max-w-lg w-full space-y-3.5">
              <form onSubmit={handleSubscribe} className="relative w-full">
                <div className="liquid-glass-dhammaduta rounded-full pl-6 pr-2 py-2 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-cyan-400">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="กรอกอีเมลเพื่อรับคู่มือหลักสูตรและข่าวสารพระธรรมทูต..."
                    className="w-full bg-transparent text-white placeholder:text-cyan-200/60 text-xs sm:text-sm focus:outline-none font-medium"
                  />
                  <button
                    type="submit"
                    aria-label="Submit email"
                    className="bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all p-3 rounded-full shrink-0 cursor-pointer shadow-md font-bold"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 font-mono-tech">
                <Link
                  href="/curriculum"
                  className="liquid-glass-dhammaduta-strong rounded-full px-5 py-2.5 text-cyan-200 text-xs sm:text-sm font-semibold hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2 shadow-md hover:scale-105 border border-cyan-400/40"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{t("portal.services.programs.title")} ↗</span>
                </Link>
                <Link
                  href="/alumni"
                  className="liquid-glass-dhammaduta-strong rounded-full px-5 py-2.5 text-white/90 text-xs sm:text-sm font-semibold hover:bg-white/20 hover:text-white transition-all flex items-center gap-2 shadow-md hover:scale-105"
                >
                  <Layers className="h-4 w-4" />
                  <span>{t("portal.services.alumni.title")}</span>
                </Link>
                <Link
                  href="/news"
                  className="liquid-glass-dhammaduta-strong rounded-full px-5 py-2.5 text-white/90 text-xs sm:text-sm font-semibold hover:bg-white/20 hover:text-white transition-all flex items-center gap-2 shadow-md hover:scale-105"
                >
                  <Newspaper className="h-4 w-4" />
                  <span>{t("portal.hero.announcements")}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (40% on desktop): Transparent Monk Cutout with 3D Mouse Gaze Orientation */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[420px] sm:min-h-[500px] lg:min-h-[580px]">
            {/* Halo backlight behind the monk */}
            <div className="absolute w-[360px] h-[360px] sm:w-[440px] h-[440px] rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
            <div className="absolute w-[240px] h-[240px] rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

            {/* The Monk Cutout Image Container - ONLY this element tilts/turns */}
            <div
              className="relative w-full h-[420px] sm:h-[500px] lg:h-[580px] transition-transform duration-100 ease-out will-change-transform flex items-end justify-center pointer-events-none"
              style={{
                transform: `perspective(1000px) rotateY(${effectiveMousePos.x * 22}deg) rotateX(${-effectiveMousePos.y * 14}deg) translate3d(${effectiveMousePos.x * 16}px, ${effectiveMousePos.y * 10}px, 0)`,
                transformOrigin: "center 38%",
              }}
            >
              {visualMode === "isolated-monk" ? (
                <NextImage
                  src="/images/monk-isolated.png"
                  alt="พระภิกษุสงฆ์ไทย นั่งสมาธิ หันมองตามเมาส์"
                  fill
                  priority
                  unoptimized
                  className="object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
                />
              ) : visualMode === "monk-look-left" ? (
                <NextImage
                  src="/images/monk-look-left-isolated.png"
                  alt="พระภิกษุสงฆ์ไทย สมาธิบงกช หันมองซ้าย"
                  fill
                  priority
                  unoptimized
                  className="object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
                />
              ) : (
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30">
                  <NextImage
                    src="/images/hero-dhammaduta-monk.jpg"
                    alt="พระสงฆ์ไทยนั่งสมาธิ ภาพผืนเดิม"
                    fill
                    priority
                    unoptimized
                    className="object-cover object-center"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Quick KPI Stats Bar */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-cyan-500/20 mt-4">
          <div className="liquid-glass-dhammaduta-strong rounded-xl p-3.5 text-center">
            <div className="font-bebas text-3xl sm:text-4xl text-amber-300 tracking-wide">
              {stats?.students ?? "1,200+"}
            </div>
            <div className="text-[11px] font-mono-tech text-cyan-200 mt-0.5 uppercase">
              {t("portal.stats.students")}
            </div>
          </div>
          <div className="liquid-glass-dhammaduta-strong rounded-xl p-3.5 text-center">
            <div className="font-bebas text-3xl sm:text-4xl text-amber-300 tracking-wide">
              {stats?.departments ?? "3"}
            </div>
            <div className="text-[11px] font-mono-tech text-cyan-200 mt-0.5 uppercase">
              {t("portal.stats.departments")}
            </div>
          </div>
          <div className="liquid-glass-dhammaduta-strong rounded-xl p-3.5 text-center">
            <div className="font-bebas text-3xl sm:text-4xl text-amber-300 tracking-wide">
              {stats?.employmentRate ?? "98.5%"}
            </div>
            <div className="text-[11px] font-mono-tech text-cyan-200 mt-0.5 uppercase">
              {t("portal.stats.employmentRate")}
            </div>
          </div>
          <div className="liquid-glass-dhammaduta-strong rounded-xl p-3.5 text-center">
            <div className="font-bebas text-3xl sm:text-4xl text-amber-300 tracking-wide">
              {stats?.publications ?? "50+"}
            </div>
            <div className="text-[11px] font-mono-tech text-cyan-200 mt-0.5 uppercase">
              {t("portal.stats.publications")}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Infinite Scrolling Dhammaduta International Network Marquee */}
      <div className="relative z-20 w-full overflow-hidden bg-[#040C1A]/90 backdrop-blur-md border-t border-cyan-500/20 py-3 select-none">
        <div className="animate-marquee-dhamma flex items-center gap-10 whitespace-nowrap text-cyan-100/90 font-bebas text-xl sm:text-2xl tracking-widest">
          {[...dhammaNetwork, ...dhammaNetwork].map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="flex items-center gap-10 hover:text-amber-300 transition-colors cursor-default"
            >
              <span>{item}</span>
              <span className="text-amber-400 text-xs">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* 6. Modal: Dhammaduta Identity & Mouse Gaze Architecture */}
      {showTechInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#081830] border border-cyan-500/30 p-6 text-white shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-cyan-500/20 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-1 border border-cyan-400/30">
                  <Globe2 className="h-3.5 w-3.5" />
                  <span>Dhammaduta Identity • อัตลักษณ์พระธรรมทูต</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  สถาปัตยกรรมแยกเลเยอร์: พื้นหลังนิ่ง 100% &amp; พระสงฆ์หันมองตามเมาส์
                </h2>
                <p className="text-xs text-cyan-200/70 mt-0.5">
                  วิทยาลัยพระธรรมทูต: สมาธิ ปัญญาญาณ นวัตกรรมดิจิทัลสู่สากล
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTechInfo(false)}
                className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Design Breakdown Points */}
            <div className="space-y-4 text-xs sm:text-sm text-cyan-100/90 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-white/5 border border-cyan-500/20 space-y-1.5">
                <div className="font-semibold text-cyan-300 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-cyan-500 text-black flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <span>พื้นหลังสีน้ำเงินธรรมทูตอยู่นิ่ง 100% (Static Background):</span>
                </div>
                <p className="text-cyan-200/80 pl-7 text-xs leading-normal">
                  พื้นหลังและตัวหนังสือฝั่งซ้ายถูกแยกออกจากองค์พระอย่างเด็ดขาด จึงอยู่นิ่งสนิท ไม่มีอาการพื้นหลังหรือตัวหนังสือเอียงตามเมาส์อีกต่อไป
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-cyan-500/20 space-y-1.5">
                <div className="font-semibold text-amber-300 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <span>องค์พระภิกษุสงฆ์ไดคัทโปร่งใสอยู่ทางขวา (Right Column Monk):</span>
                </div>
                <p className="text-cyan-200/80 pl-7 text-xs leading-normal">
                  จัดวางองค์พระไว้ทางฝั่งขวา โดยตั้งจุดหมุน <code>transform-origin: center 38%</code> เมื่อผู้ใช้นำเมาส์ไปอ่านข้อความทางซ้าย ศีรษะและสายตาของพระสงฆ์จะหมุน <code>rotateY</code> หันมองมายังข้อความทางซ้ายอย่างลงตัวและมีชีวิตชีวา
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-cyan-500/20 space-y-1.5">
                <div className="font-semibold text-emerald-300 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-400 text-black flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  <span>ระบบฟิสิกส์การหน่วงความเร็ว (Spring Lerp 60FPS):</span>
                </div>
                <p className="text-cyan-200/80 pl-7 text-xs leading-normal">
                  คำนวณเวกเตอร์พิกัดเมาส์อย่างนุ่มนวล ไม่กระตุก ทำให้การเคลื่อนไหวของศีรษะดูเหมือนมนุษย์จริง
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={() => {
                  const promptText =
                    "Ultra high-resolution studio photography of a serene revered Thai Buddhist monk wearing authentic saffron orange robe, looking forward with wise eyes. Isolated on transparent background, photorealistic 8k masterpiece.";
                  navigator.clipboard.writeText(promptText);
                  setHasCopied(true);
                  toast.success("คัดลอก Prompt เรียบร้อยแล้ว!");
                  setTimeout(() => setHasCopied(false), 2500);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 text-[11px] font-bold transition-transform active:scale-95 shadow-xs cursor-pointer"
              >
                {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{hasCopied ? "คัดลอกแล้ว!" : "คัดลอก AI Prompt"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTechInfo(false)}
                className="px-5 py-1.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold transition-all shadow-sm"
              >
                เข้าใจแล้ว / ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
