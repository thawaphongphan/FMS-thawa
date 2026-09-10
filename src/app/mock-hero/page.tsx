"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  ArrowRight,
  Sparkles,
  Instagram,
  Twitter,
  Linkedin,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Layers,
  ArrowLeft,
  Flame,
  Image as ImageIcon,
  Video,
  HelpCircle,
  X,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export default function MockHeroPage() {
  const [theme, setTheme] = useState<"dharma" | "faculty" | "asme">("dharma");
  const [bgType, setBgType] = useState<"monk" | "video">("monk");
  const [monkVisual, setMonkVisual] = useState<"ring" | "pure">("ring");
  const [monkOffsetY, setMonkOffsetY] = useState(22); // percent down so text never covers the face
  const [showTechInfo, setShowTechInfo] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  // Custom requestAnimationFrame-based fade system for video loop
  useEffect(() => {
    if (bgType !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    const fade = (startOpacity: number, targetOpacity: number, durationMs: number, onComplete?: () => void) => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const current = startOpacity + (targetOpacity - startOpacity) * progress;
        video.style.opacity = String(current);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          animFrameRef.current = null;
          if (onComplete) onComplete();
        }
      };
      animFrameRef.current = requestAnimationFrame(tick);
    };

    const handleLoadedData = () => {
      video.style.opacity = "0";
      fade(0, 1, 500);
    };

    const handleTimeUpdate = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const timeLeft = video.duration - video.currentTime;

      if (timeLeft <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        const currentOpacity = parseFloat(video.style.opacity || "1");
        fade(currentOpacity, 0, 500);
      }
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        fadingOutRef.current = false;
        fade(0, 1, 500);
      }, 100);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [bgType]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success(
      theme === "dharma"
        ? "ลงทะเบียนรับคู่มือจิตภาวนาและข่าวสารธรรมศึกษาเรียบร้อยแล้ว อนุโมทนาสาธุครับ"
        : theme === "faculty"
        ? "ลงทะเบียนรับข่าวสารและรอบรับสมัครสำเร็จแล้ว!"
        : "Thank you for subscribing to the newsletter!"
    );
    setEmail("");
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-between select-none">
      {/* Google Font & Liquid Glass Custom CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap');

        .liquid-glass {
          background: rgba(255, 255, 255, 0.03);
          background-blend-mode: luminosity;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: none;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }

        .liquid-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.55) 0%,
            rgba(255, 255, 255, 0.2) 20%,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0) 60%,
            rgba(255, 255, 255, 0.2) 80%,
            rgba(255, 255, 255, 0.55) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .font-instrument {
          font-family: 'Instrument Serif', Georgia, serif;
        }

        @keyframes kenburns {
          0% {
            transform: translateY(var(--monk-shift, 22%)) scale(1.08);
          }
          50% {
            transform: translateY(calc(var(--monk-shift, 22%) - 1.5%)) scale(1.13);
          }
          100% {
            transform: translateY(var(--monk-shift, 22%)) scale(1.08);
          }
        }

        .animate-kenburns {
          animation: kenburns 24s ease-in-out infinite alternate;
        }

        @keyframes float-particle {
          0% {
            transform: translateY(0px) translateX(0px) scale(0.8);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-40px) translateX(15px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-80px) translateX(-10px) scale(0.8);
            opacity: 0.1;
          }
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0) 70%);
          pointer-events: none;
          animation: float-particle 8s ease-in-out infinite;
        }

        /* Refined Organic Twinkling Stardust & Ethereal Breathing Glow */
        @keyframes subtle-ring-pulse {
          0%, 100% {
            opacity: 0.85;
            filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4)) drop-shadow(0 0 35px rgba(56, 189, 248, 0.3));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 25px rgba(251, 191, 36, 0.7)) drop-shadow(0 0 50px rgba(244, 114, 182, 0.5));
          }
        }

        @keyframes twinkle-star {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.6) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.3) rotate(180deg);
          }
        }

        .twinkle-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(251, 191, 36, 0.8) 40%, rgba(251, 191, 36, 0) 80%);
          pointer-events: none;
          animation: twinkle-star 3s ease-in-out infinite;
        }
      `}} />

      {/* Background Visual Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {bgType === "monk" ? (
          /* Thai Monk Meditating with Lotus Flowers Visual & Celestial Rotating Ring */
          <div className="relative w-full h-full">
            {/* High-res cinematic meditating monk */}
            <img
              src={monkVisual === "ring" ? "/images/monk-lotus-ring.jpg" : "/images/monk-lotus-meditation.jpg"}
              alt="พระภิกษุสงฆ์ไทยกำลังนั่งสมาธิท่ามกลางดอกบัวบงกชและวงแหวนรัศมีหมุนรอบ"
              className="absolute inset-0 w-full h-full object-cover animate-kenburns transition-all duration-700"
              style={{
                "--monk-shift": `${monkOffsetY}%`,
                transformOrigin: "center top",
              } as React.CSSProperties}
            />

            {/* Ethereal Natural Twinkling Stardust along the Celestial Ring */}
            {monkVisual === "ring" && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-700"
                style={{
                  transform: `translateY(${monkOffsetY * 0.55}%)`,
                }}
              >
                {/* Micro-sparkles aligned with the cosmic ring's natural orbit */}
                <div className="twinkle-particle w-3 h-3 top-[51%] left-[23%] [animation-delay:0.2s]" />
                <div className="twinkle-particle w-2 h-2 top-[54%] left-[29%] [animation-delay:1.1s]" />
                <div className="twinkle-particle w-2.5 h-2.5 top-[58%] left-[37%] [animation-delay:0.7s]" />
                <div className="twinkle-particle w-3.5 h-3.5 top-[60%] left-[48%] [animation-delay:1.8s]" />
                <div className="twinkle-particle w-2 h-2 top-[58%] left-[62%] [animation-delay:2.3s]" />
                <div className="twinkle-particle w-3 h-3 top-[54%] left-[73%] [animation-delay:0.5s]" />
                <div className="twinkle-particle w-2.5 h-2.5 top-[49%] left-[81%] [animation-delay:1.4s]" />
                <div className="twinkle-particle w-1.5 h-1.5 top-[44%] left-[72%] [animation-delay:2.8s]" />
                <div className="twinkle-particle w-2 h-2 top-[46%] left-[32%] [animation-delay:1.9s]" />
              </div>
            )}

            {/* Ambient Animated Golden Light Particles / Fireflies */}
            <div className="particle w-3 h-3 top-[65%] left-[20%] [animation-delay:0s]" />
            <div className="particle w-2 h-2 top-[55%] left-[32%] [animation-delay:2s]" />
            <div className="particle w-4 h-4 top-[70%] left-[68%] [animation-delay:1.5s]" />
            <div className="particle w-2.5 h-2.5 top-[48%] left-[78%] [animation-delay:3.5s]" />
            <div className="particle w-2 h-2 top-[60%] left-[85%] [animation-delay:4s]" />
            <div className="particle w-3.5 h-3.5 top-[40%] left-[25%] [animation-delay:5s]" />

            {/* Spiritual Radial Vignette & Shimmering Ambient Lighting */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/65" />
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-black/20 to-black/75" />
          </div>
        ) : (
          /* Original Video Background */
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover translate-y-[17%] transition-opacity"
              style={{ opacity: 1 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />
            <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/80" />
          </div>
        )}
      </div>

      {/* Top Demo Bar / Visual & Theme Switcher */}
      <div className="relative z-30 w-full border-b border-white/10 bg-black/50 backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-[11px] font-medium"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>กลับหน้าพอร์ทัลหลัก</span>
          </Link>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-white/80 font-medium hidden sm:flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>ASME Motion Hero: พระสงฆ์นั่งสมาธิ & ดอกบัว</span>
          </span>
        </div>

        {/* Background Visual Selector & Theme Tabs */}
        <div className="flex items-center gap-2">
          {/* Background Toggle (Monk & Lotus vs Video) */}
          <div className="inline-flex rounded-full bg-white/10 p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setBgType("monk");
                setTheme("dharma");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                bgType === "monk"
                  ? "bg-amber-500 text-black shadow-sm font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <ImageIcon className="h-3 w-3" />
              <span>พระสงฆ์ & ดอกบัว (ภาพใหม่)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBgType("video");
                setTheme("asme");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                bgType === "video"
                  ? "bg-white text-black shadow-sm font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Video className="h-3 w-3" />
              <span>วิดีโอ 3D Abstract (เดิม)</span>
            </button>
          </div>

          {/* Monk Mode Sub-options */}
          {bgType === "monk" && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 text-[11px]">
              {/* Visual Style Selector */}
              <div className="inline-flex rounded-full bg-white/10 p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setMonkVisual("ring")}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    monkVisual === "ring"
                      ? "bg-amber-400 text-black shadow-xs font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                  title="ภาพพระสงฆ์พร้อมวงแหวนรัศมีธรรมสีรุ้งระยิบระยับ"
                >
                  ✨ รัศมีธรรม 3D
                </button>
                <button
                  type="button"
                  onClick={() => setMonkVisual("pure")}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    monkVisual === "pure"
                      ? "bg-amber-400 text-black shadow-xs font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                  title="ภาพพระสงฆ์สมาธิธรรมชาติบริสุทธิ์"
                >
                  🪷 สมาธิสงบเงียบ
                </button>
              </div>

              {/* Position Offset */}
              <span className="hidden lg:inline text-white/50 pl-1">ขยับลง:</span>
              <button
                type="button"
                onClick={() => setMonkOffsetY(15)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                  monkOffsetY === 15 ? "bg-amber-400 text-black font-bold" : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                15%
              </button>
              <button
                type="button"
                onClick={() => setMonkOffsetY(22)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                  monkOffsetY === 22 ? "bg-amber-400 text-black font-bold" : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                22%
              </button>
              <button
                type="button"
                onClick={() => setMonkOffsetY(30)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                  monkOffsetY === 30 ? "bg-amber-400 text-black font-bold" : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                30%
              </button>
            </div>
          )}

          {/* Tech Breakdown Explainer Button */}
          <button
            type="button"
            onClick={() => setShowTechInfo(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/35 border border-amber-400/40 transition-all hover:scale-105"
            title="เจาะลึกว่าต้นฉบับ ASME ทำวงแหวนอย่างไร ทำไมถึงสวยมาก และทำไม CSS ถึงทำไม่ได้"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>💡 เจาะลึกวงแหวน ASME</span>
          </button>

          {/* Video Controls (Visible only in video mode) */}
          {bgType === "video" && (
            <div className="hidden md:flex items-center gap-1 pl-2 border-l border-white/10">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause video" : "Play video"}
                className="p-1 text-white/70 hover:text-white transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                className="p-1 text-white/70 hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Liquid-Glass Navigation Bar */}
      <header className="relative z-20 px-6 py-6 w-full">
        <nav className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 border border-amber-400/30 group-hover:scale-105 transition-transform">
                {bgType === "monk" ? (
                  <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                {theme === "dharma"
                  ? "วิทยาลัยพุทธศาสตร์ & นวัตกรรมดิจิทัล"
                  : theme === "faculty"
                  ? "Faculty of Digital Tech"
                  : "Asme"}
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              {theme === "dharma" ? (
                <>
                  <Link href="/curriculum" className="text-white/80 hover:text-white transition-colors">
                    หลักสูตรพุทธนวัตกรรม
                  </Link>
                  <Link href="/schedule" className="text-white/80 hover:text-white transition-colors">
                    ตารางปฏิบัติ & ธรรมศึกษา
                  </Link>
                  <Link href="/alumni" className="text-white/80 hover:text-white transition-colors">
                    ทำเนียบศิษย์เก่า
                  </Link>
                  <Link href="/statistics" className="text-white/80 hover:text-white transition-colors">
                    สถิตินิสิต
                  </Link>
                  <Link href="/news" className="text-white/80 hover:text-white transition-colors">
                    ข่าวสารคณะ
                  </Link>
                </>
              ) : theme === "faculty" ? (
                <>
                  <Link href="/curriculum" className="text-white/80 hover:text-white transition-colors">
                    หลักสูตร
                  </Link>
                  <Link href="/schedule" className="text-white/80 hover:text-white transition-colors">
                    ตารางเรียน/สอบ
                  </Link>
                  <Link href="/alumni" className="text-white/80 hover:text-white transition-colors">
                    ทำเนียบศิษย์เก่า
                  </Link>
                  <Link href="/statistics" className="text-white/80 hover:text-white transition-colors">
                    สถิตินิสิต
                  </Link>
                  <Link href="/news" className="text-white/80 hover:text-white transition-colors">
                    ข่าวสาร
                  </Link>
                </>
              ) : (
                <>
                  <a href="#features" className="text-white/80 hover:text-white transition-colors">
                    Features
                  </a>
                  <a href="#pricing" className="text-white/80 hover:text-white transition-colors">
                    Pricing
                  </a>
                  <a href="#about" className="text-white/80 hover:text-white transition-colors">
                    About
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Nav Right CTA */}
          <div className="flex items-center gap-3">
            {theme === "dharma" ? (
              <>
                <Link
                  href="/login"
                  className="text-white/90 hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors hidden sm:block"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/curriculum"
                  className="liquid-glass rounded-full px-5 py-2 text-amber-200 border border-amber-400/30 text-xs font-semibold hover:bg-white/10 transition-colors shadow-xs"
                >
                  สมัครเรียน / ธรรมศึกษา
                </Link>
              </>
            ) : theme === "faculty" ? (
              <>
                <Link
                  href="/login"
                  className="text-white/90 hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors hidden sm:block"
                >
                  เข้าสู่ระบบเจ้าหน้าที่
                </Link>
                <Link
                  href="/curriculum"
                  className="liquid-glass rounded-full px-5 py-2 text-white text-xs font-semibold hover:bg-white/10 transition-colors shadow-xs"
                >
                  สมัครเข้าศึกษา
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="text-white hover:text-white/80 text-sm font-medium transition-colors hidden sm:block"
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Content Area - Elevated into upper sky to leave monk face completely uncovered */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-6 text-center -translate-y-[14%] sm:-translate-y-[20%] md:-translate-y-[24%]">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 rounded-full liquid-glass px-4 py-1.5 text-xs font-medium text-amber-200 mb-6 animate-fade-in shadow-xs border border-amber-400/20">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>
            {theme === "dharma"
              ? "จิตภาวนา • สมาธิ ปัญญา นวัตกรรมแห่งความสงบสุข"
              : theme === "faculty"
              ? "TCAS 2569 • เปิดรับสมัครบุคคลเข้าศึกษาต่อทุกระดับชั้น"
              : "Next Generation AI Design Experience"}
          </span>
        </div>

        {/* Cinematic Heading in Instrument Serif */}
        <h1
          className="font-instrument text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6 tracking-tight leading-[1.05] max-w-5xl text-balance drop-shadow-lg"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          {theme === "dharma" ? (
            <>
              Stillness Within, <br />
              <span className="italic font-light text-amber-200/90">Infinite Wisdom</span>
            </>
          ) : theme === "faculty" ? (
            <>
              Where Curiosity <br />
              <span className="italic font-light opacity-90">Meets Digital Mastery</span>
            </>
          ) : (
            "Built for the curious"
          )}
        </h1>

        {/* Action / Search / Email Input Container */}
        <div className="max-w-xl w-full space-y-4 mt-2">
          <form onSubmit={handleSubscribe} className="relative w-full">
            <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-amber-400/40">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  theme === "dharma"
                    ? "กรอกอีเมลเพื่อรับคู่มือจิตภาวนาและหลักสูตรธรรมศึกษา..."
                    : theme === "faculty"
                    ? "กรอกอีเมลเพื่อรับระเบียบการและข่าวสารรอบรับสมัคร..."
                    : "Enter your email"
                }
                className="w-full bg-transparent text-white placeholder:text-white/60 text-sm focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Submit email"
                className="bg-amber-400 text-black hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all p-3 rounded-full shrink-0 cursor-pointer shadow-md font-bold"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Subtitle description */}
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed px-4 max-w-lg mx-auto drop-shadow-md">
            {theme === "dharma" ? (
              "การผสานศาสตร์แห่งสติและจิตภาวนา เข้ากับการเรียนรู้และเทคโนโลยีสมัยใหม่ เพื่อหล่อหลอมปัญญา คุณธรรม และสันติสุขที่ยั่งยืน"
            ) : theme === "faculty" ? (
              "คณะเทคโนโลยีดิจิทัลและสารสนเทศ มุ่งเน้นการเรียนรู้เชิงปฏิบัติการ สร้างสรรค์นวัตกรรม AI และซอฟต์แวร์ระดับสากล เพื่อเป็นผู้นำแห่งอนาคต"
            ) : (
              "Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates."
            )}
          </p>

          {/* Secondary CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {theme === "dharma" ? (
              <>
                <Link
                  href="/curriculum"
                  className="liquid-glass rounded-full px-7 py-3 text-amber-200 text-xs font-semibold hover:bg-white/10 transition-all flex items-center gap-2 shadow-xs hover:scale-105 border border-amber-400/20"
                >
                  <Layers className="h-3.5 w-3.5 text-amber-300" />
                  <span>ค้นหาหลักสูตรการศึกษา</span>
                </Link>
                <Link
                  href="/alumni"
                  className="liquid-glass rounded-full px-7 py-3 text-white/90 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 shadow-xs hover:scale-105"
                >
                  <span>เรื่องราวความสำเร็จศิษย์เก่า</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : theme === "faculty" ? (
              <>
                <Link
                  href="/curriculum"
                  className="liquid-glass rounded-full px-7 py-3 text-white text-xs font-semibold hover:bg-white/10 transition-all flex items-center gap-2 shadow-xs hover:scale-105"
                >
                  <Layers className="h-3.5 w-3.5 text-primary-foreground" />
                  <span>ค้นหาหลักสูตรทั้งหมด</span>
                </Link>
                <Link
                  href="/alumni"
                  className="liquid-glass rounded-full px-7 py-3 text-white/90 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 shadow-xs hover:scale-105"
                >
                  <span>เรื่องราวความสำเร็จศิษย์เก่า</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <button
                type="button"
                className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/10 transition-all hover:scale-105 shadow-xs"
              >
                Manifesto
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer Social Icons & Credentials */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-6 pb-8 max-w-6xl mx-auto w-full gap-4">
        <div className="text-[11px] text-white/60 text-center sm:text-left drop-shadow-xs">
          {theme === "dharma" ? (
            <span>© 2026 วิทยาลัยพุทธศาสตร์และนวัตกรรมดิจิทัล • จิตภาวนา & ปัญญาญาณ</span>
          ) : theme === "faculty" ? (
            <span>© 2026 Faculty Web Platform. Vibe Modular Monolith Architecture.</span>
          ) : (
            <span>© Motionsites AI 2026. All rights reserved.</span>
          )}
        </div>

        {/* Liquid Glass Social Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="liquid-glass rounded-full p-3 text-white/80 hover:text-white hover:bg-white/10 hover:scale-110 transition-all"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="liquid-glass rounded-full p-3 text-white/80 hover:text-white hover:bg-white/10 hover:scale-110 transition-all"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="liquid-glass rounded-full p-3 text-white/80 hover:text-white hover:bg-white/10 hover:scale-110 transition-all"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <Link
            href="/"
            aria-label="Main Faculty Portal"
            className="liquid-glass rounded-full p-3 text-white/80 hover:text-white hover:bg-white/10 hover:scale-110 transition-all"
            title="กลับหน้าพอร์ทัลหลัก"
          >
            <Globe className="h-4 w-4" />
          </Link>
        </div>
      </footer>

      {/* Tech Breakdown Modal: How ASME Ring Works & Why CSS Failed */}
      {showTechInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl liquid-glass border border-white/20 p-6 text-white shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-1 border border-amber-400/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Technical Analysis • เบื้องหลังความงาม</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  วงแหวนต้นฉบับ ASME เขาทำอย่างไร? ทำไมถึงสวยมาก?
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  วิเคราะห์เจาะลึกจากซอร์สโค้ดและไฟล์วิดีโอจริงของ motionsites.ai/?prompt=asme-hero
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

            {/* 4 Core Technical Realities */}
            <div className="space-y-4 text-xs sm:text-sm text-white/80 leading-relaxed">
              {/* Point 1 */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="font-semibold text-amber-300 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-black">1</span>
                  <span>ความจริง: ต้นฉบับ &quot;ไม่ได้เขียนโค้ด CSS&quot; สำหรับวงแหวนเลย!</span>
                </div>
                <p className="text-white/70 pl-7 text-xs leading-normal">
                  ในเว็บ ASME Hero ต้นฉบับไม่มีโค้ด CSS หรือ SVG สำหรับวาดหรือหมุนวงแหวนเลยแม้แต่บรรทัดเดียว แต่ทั้งหมดคือ <strong>ไฟล์วิดีโอ MP4</strong> (ความยาว 10.04 วินาที, ความละเอียด 1924x1076, 24fps) ที่ถูกสร้างโดยโมเดล <strong>AI Video Generator (Hailuo AI / Minimax Video-01)</strong> แล้วนำมาเล่นวนลูปผ่านแท็ก <code className="bg-black/50 px-1 py-0.5 rounded text-amber-200">&lt;video autoPlay loop muted&gt;</code>
                </p>
              </div>

              {/* Point 2 */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="font-semibold text-sky-300 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-sky-400 text-black flex items-center justify-center text-xs font-black">2</span>
                  <span>ทำไมของเดิมถึงสวยมากระดับภาพยนตร์ (Cinematic Quality):</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-7 text-white/70 text-xs">
                  <li>
                    <strong className="text-white">3D Depth & Occlusion:</strong> วงแหวนไม่ได้เป็นแผ่นแบนลอยข้างหน้า แต่ส่วนโค้งด้านหลัง <em>พาดอ้อมไปข้างหลังคอและไหล่</em> ส่วนโค้งด้านหน้า <em>พาดอยู่หน้าตักและแล็ปท็อป</em>
                  </li>
                  <li>
                    <strong className="text-white">Bounce Light (แสงสะท้อนฟิสิกส์):</strong> แสงสีรุ้งเรืองรองจากวงแหวน <em>สาดส่องกระทบลงบนเสื้อฮู้ด แป้นพิมพ์ และดอกไม้</em> อย่างมีชีวิตชีวาตามการหมุน
                  </li>
                  <li>
                    <strong className="text-white">Volumetric Nebula Stardust:</strong> ประกอบด้วยละอองดาวนับพันดวง ฝุ่นหมอกเนบิวลา และประกายแสงเลนส์แฟลร์ ไม่ใช่เส้น vector แบนๆ
                  </li>
                </ul>
              </div>

              {/* Point 3 */}
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1.5">
                <div className="font-semibold text-rose-300 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-rose-400 text-black flex items-center justify-center text-xs font-black">3</span>
                  <span>ทำไม CSS Conic Gradient ที่เราทำก่อนหน้านี้ถึง &quot;ยังไม่ได้เรื่อง&quot;:</span>
                </div>
                <p className="text-white/70 pl-7 text-xs leading-normal">
                  เมื่อเราเปลี่ยนคนเป็นพระสงฆ์บนภาพนิ่ง แล้วพยายามจำลองวงแหวนด้วย CSS <code className="bg-black/50 px-1 py-0.5 rounded text-rose-200">conic-gradient</code> ผลลัพธ์จึงกลายเป็น <strong>&quot;ห่วงพลาสติกแบนๆ 2D สีรุ้ง&quot;</strong> ที่ลอยทับรูป ขาดมิติความลึก ไม่ส่องแสงสะท้อนลงบนจีวรหรือผิวน้ำ จึงดูขัดตา แข็งทื่อ และหลอกตามาก
                </p>
              </div>

              {/* Point 4 */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                <div className="font-semibold text-emerald-300 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-400 text-black flex items-center justify-center text-xs font-black">4</span>
                  <span>สิ่งที่เราปรับปรุงแก้ไขให้แล้วในหน้านี้:</span>
                </div>
                <div className="text-white/70 pl-7 text-xs space-y-1">
                  <p>
                    ✅ <strong>ถอดวงแหวน CSS พลาสติกแข็งๆ ออกทั้งหมด</strong> เพื่อไม่ให้บดบังความงาม
                  </p>
                  <p>
                    ✅ <strong>ใช้ภาพเรนเดอร์ <span className="text-emerald-200 font-mono">monk-lotus-ring.jpg</span></strong> ที่มีวงแหวนละอองดาวแบบ 3D พาดผ่านหลังไหล่ และสะท้อนแสงลงบนผิวน้ำและกลีบบัวอย่างสมจริง
                  </p>
                  <p>
                    ✅ <strong>เสริมละอองดาวระยิบระยับ (Twinkle Particles)</strong> ให้มีชีวิตชีวาอย่างกลมกลืน
                  </p>
                </div>
              </div>
            </div>

            {/* Video Prompt Generator Box */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Prompt สำหรับนำไปสร้าง AI Video หมุนได้ 100% เหมือน ASME:</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const promptText = "Cinematic 4k video, a serene Thai Buddhist monk meditating in full lotus position on a floating wooden deck in a calm lotus pond at twilight. A glowing celestial 3D cosmic ring of rainbow stardust, nebula gas, and sparkling galaxy particles rotates smoothly around his torso, passing behind his shoulders and in front of his lap. The rotating light casts dynamic warm illumination and reflections across the water ripples, his saffron robe, and blooming pink and white lotus flowers. Ancient temple silhouette in the misty background under a starry night sky. Photorealistic, 24fps, volumetric lighting, masterpiece.";
                    navigator.clipboard.writeText(promptText);
                    setHasCopied(true);
                    toast.success("คัดลอก Prompt สำหรับ AI Video เรียบร้อยแล้ว!");
                    setTimeout(() => setHasCopied(false), 2500);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black hover:bg-amber-300 text-[11px] font-bold transition-transform active:scale-95 shadow-xs cursor-pointer"
                >
                  {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{hasCopied ? "คัดลอกแล้ว!" : "คัดลอก Prompt"}</span>
                </button>
              </div>
              <p className="text-[11px] text-white/70 font-mono bg-black/40 p-2.5 rounded-lg border border-white/5 select-all leading-relaxed">
                Cinematic 4k video, a serene Thai Buddhist monk meditating in full lotus position on a floating wooden deck in a calm lotus pond at twilight. A glowing celestial 3D cosmic ring of rainbow stardust, nebula gas, and sparkling galaxy particles rotates smoothly around his torso, passing behind his shoulders and in front of his lap. The rotating light casts dynamic warm illumination and reflections across the water ripples, his saffron robe, and blooming pink and white lotus flowers. Ancient temple silhouette in the misty background under a starry night sky. Photorealistic, 24fps, volumetric lighting, masterpiece.
              </p>
              <p className="text-[10px] text-white/50">
                💡 สามารถนำ Prompt นี้ไปวางใน <strong>Hailuo AI (minimax), Kling AI, Runway Gen-3</strong> เพื่อเรนเดอร์เป็นคลิป MP4 หมุนวนต่อเนื่องได้ทันที
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setBgType("video");
                  setTheme("asme");
                  setShowTechInfo(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-sky-200 transition-colors underline underline-offset-4"
              >
                <Video className="h-3.5 w-3.5" />
                <span>สลับไปดูวิดีโอตัวจริงของ ASME เดี๋ยวนี้</span>
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
    </div>
  );
}
