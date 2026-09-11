"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export interface CinematicHeroProps {
  stats?: {
    students?: string;
    departments?: string;
    employmentRate?: string;
    publications?: string;
  };
}

/** Custom typewriter hook */
export function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const timeoutId = setTimeout(() => {
      setDisplayed("");
      setDone(false);
      intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex++;
          setDisplayed(text.slice(0, currentIndex));
        } else {
          setDone(true);
          clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export function CinematicHero({ stats: _stats }: CinematicHeroProps = {}) {
  // Mode: 3D Monk (360° Lerp isolated), Monk Video scrub, or Mainframe A.R.I.A
  const [characterMode, setCharacterMode] = useState<"monk" | "monk_video" | "mainframe">("monk");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);

  // 360° Omnidirectional Spring & Lerp Refs (60 FPS without React re-render stutter)
  const targetXRef = useRef<number>(0);
  const targetYRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  const monk3DContainerRef = useRef<HTMLDivElement>(null);
  const monkLeftLayerRef = useRef<HTMLImageElement>(null);
  const monkCenterLayerRef = useRef<HTMLImageElement>(null);
  const monkRightLayerRef = useRef<HTMLImageElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(1.0);
  const isSeekingRef = useRef<boolean>(false);
  const SENSITIVITY = 0.8;

  // Typewriter animation
  const { displayed, done } = useTypewriter(
    "Glad you stopped in. Good taste tends to find us. Now, what are we building?",
    38,
    600
  );

  // Pill buttons appear 400ms after load
  useEffect(() => {
    const timer = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // 360° Spring Lerp 60 FPS Render Loop & Motion Controller
  useEffect(() => {
    let animId: number;

    const render3DLoop = () => {
      // Smooth linear interpolation (Lerp) damping factor 0.08 for fluid inertia
      currentXRef.current += (targetXRef.current - currentXRef.current) * 0.08;
      currentYRef.current += (targetYRef.current - currentYRef.current) * 0.08;

      // 360° rotation: X axis controls vertical tilt (up/down), Y axis controls horizontal turn (left/right)
      const rotY = currentXRef.current * 26; // -26deg to +26deg
      const rotX = -currentYRef.current * 18; // -18deg (look down) to +18deg (look up)
      const rotZ = currentXRef.current * -2.5; // Natural subtle neck tilt
      const transZ = 15;

      // Apply 3D perspective rotation directly to isolated monk container (Background stays 100% static)
      if (monk3DContainerRef.current) {
        monk3DContainerRef.current.style.transform = `perspective(1000px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) translateZ(${transZ}px)`;
      }

      // Smooth multi-angle gaze opacity crossfade without any frame pops
      // When turning left towards text (rotY < 0)
      const leftWeight = rotY < 0 ? Math.min(1, Math.max(0, (-rotY - 2.5) / 12)) : 0;
      // When turning right (rotY > 0)
      const rightWeight = rotY > 0 ? Math.min(1, Math.max(0, (rotY - 2.5) / 12)) : 0;
      const centerWeight = Math.max(0, 1 - leftWeight - rightWeight);

      if (monkLeftLayerRef.current) {
        monkLeftLayerRef.current.style.opacity = leftWeight.toFixed(3);
      }
      if (monkCenterLayerRef.current) {
        monkCenterLayerRef.current.style.opacity = centerWeight.toFixed(3);
      }
      if (monkRightLayerRef.current) {
        monkRightLayerRef.current.style.opacity = rightWeight.toFixed(3);
      }

      animId = requestAnimationFrame(render3DLoop);
    };

    animId = requestAnimationFrame(render3DLoop);

    const handleMouseMove = (e: MouseEvent) => {
      const windowW = window.innerWidth || 1;
      const windowH = window.innerHeight || 1;

      // The monk is positioned at ~72% horizontally and 42% vertically
      const charCenterX = windowW * 0.72;
      const charCenterY = windowH * 0.42;

      // Normalized 360° vector from monk's head to cursor (-1 to +1)
      const dx = Math.max(-1.2, Math.min(1.2, (e.clientX - charCenterX) / (windowW * 0.55)));
      const dy = Math.max(-1.2, Math.min(1.2, (e.clientY - charCenterY) / (windowH * 0.45)));

      targetXRef.current = dx;
      targetYRef.current = dy;

      // Video scrubbing for video modes
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) return;

      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      targetTimeRef.current = Math.max(0, Math.min(video.duration, targetTimeRef.current + timeOffset));

      if (!isSeekingRef.current) {
        if (Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
          isSeekingRef.current = true;
          try {
            video.currentTime = targetTimeRef.current;
          } catch {
            isSeekingRef.current = false;
          }
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as MouseEvent);
      }
    };

    const handleMouseLeave = () => {
      // Return gently to center when cursor leaves viewport
      targetXRef.current = 0;
      targetYRef.current = 0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const initialTime = video.duration * 0.5;
    targetTimeRef.current = initialTime;
    try {
      video.currentTime = initialTime;
    } catch {
      // ignore
    }
  };

  const handleSeeked = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.02) {
      isSeekingRef.current = true;
      try {
        video.currentTime = targetTimeRef.current;
      } catch {
        isSeekingRef.current = false;
      }
    } else {
      isSeekingRef.current = false;
    }
  };

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("hello@mainframe.co");
      toast.success("Copied hello@mainframe.co to clipboard!");
    }
  };

  const videoSrc =
    characterMode === "mainframe"
      ? "/videos/mainframe-cursor.mp4"
      : "/videos/monk-3d-cursor.mp4";

  return (
    <section className="relative w-full min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] overflow-hidden bg-[#051124] text-white font-[var(--font-body)] select-text flex flex-col justify-between">
      {/* 1. BACKGROUND (100% STILL & STATIC Dhammaduta Navy Blue with Ambient Radial Glow) */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-[#051124]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(5,86,202,0.32)_0%,rgba(4,14,29,0.2)_60%,transparent_85%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040e1d]/90 via-transparent to-[#040e1d]/50" />
      </div>

      {/* 2. CHARACTER LAYER (ISOLATED 3D MONK WITH 360° SMOOTH LERP GAZE TRACKING) */}
      {characterMode === "monk" ? (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden flex items-end justify-end">
          {/* Isolated 3D Character Container - Pivots smoothly around neck/head in 360 degrees */}
          <div
            ref={monk3DContainerRef}
            className="absolute inset-0 w-full h-full select-none pointer-events-none"
            style={{
              transformOrigin: "72% 45%",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {/* Base Layer: Center Looking Forward */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={monkCenterLayerRef}
              src="/images/monk-3d-center-isolated.png"
              alt="Phra Dhammaduta 3D Center"
              className="absolute inset-0 w-full h-full object-cover object-[70%_center] pointer-events-none transition-none"
            />
            {/* Layer 2: Looking Left (Smooth Opacity Crossfade) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={monkLeftLayerRef}
              src="/images/monk-3d-left-isolated.png"
              alt="Phra Dhammaduta 3D Left"
              className="absolute inset-0 w-full h-full object-cover object-[70%_center] pointer-events-none transition-none"
              style={{ opacity: 0 }}
            />
            {/* Layer 3: Looking Right (Smooth Opacity Crossfade) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={monkRightLayerRef}
              src="/images/monk-3d-right-isolated.png"
              alt="Phra Dhammaduta 3D Right"
              className="absolute inset-0 w-full h-full object-cover object-[70%_center] pointer-events-none transition-none"
              style={{ opacity: 0 }}
            />
          </div>
        </div>
      ) : (
        /* Video Scrubbing Mode (Monk Video or Mainframe Original) */
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onSeeked={handleSeeked}
          className="fixed inset-0 w-full h-full object-cover object-[70%_center] z-0 pointer-events-none"
        />
      )}

      {/* NAVBAR (inside hero, z-index: 10) */}
      <header className="relative z-10 w-full px-5 sm:px-8 py-3.5 flex justify-between items-center bg-black/20 backdrop-blur-xs border-b border-white/10">
        {/* Logo (left) */}
        <div className="flex items-center gap-3 select-none">
          <span className="text-[20px] sm:text-[24px] tracking-tight text-white font-[var(--font-heading)]">
            Mainframe&reg;
          </span>
          <span
            className="text-[24px] sm:text-[28px] text-white select-none tracking-[-0.02em]"
            aria-hidden="true"
          >
            &#10033;&#xfe0e;
          </span>
        </div>

        {/* Desktop nav links (center, hidden below md) */}
        <nav className="hidden md:flex items-center text-[20px] text-white space-x-0 font-[var(--font-body)]">
          <a href="#labs" className="hover:opacity-60 transition-opacity">
            Labs
          </a>
          <span className="select-none">,&nbsp;</span>
          <a href="#studio" className="hover:opacity-60 transition-opacity">
            Studio
          </a>
          <span className="select-none">,&nbsp;</span>
          <a href="#openings" className="hover:opacity-60 transition-opacity">
            Openings
          </a>
          <span className="select-none">,&nbsp;</span>
          <a href="#shop" className="hover:opacity-60 transition-opacity">
            Shop
          </a>
        </nav>

        {/* Desktop CTA (right, hidden below md) */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#contact"
            className="text-[20px] text-white underline underline-offset-2 hover:opacity-60 transition-opacity font-[var(--font-body)]"
          >
            Get in touch
          </a>
        </div>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 focus:outline-none cursor-pointer z-20"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </header>

      {/* Mobile overlay (z-index: 9) */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex flex-col justify-center px-8 gap-8 transition-all duration-300 md:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <a
          href="#labs"
          onClick={() => setMobileMenuOpen(false)}
          className="text-[32px] font-medium text-white hover:opacity-70 transition-opacity"
        >
          Labs
        </a>
        <a
          href="#studio"
          onClick={() => setMobileMenuOpen(false)}
          className="text-[32px] font-medium text-white hover:opacity-70 transition-opacity"
        >
          Studio
        </a>
        <a
          href="#openings"
          onClick={() => setMobileMenuOpen(false)}
          className="text-[32px] font-medium text-white hover:opacity-70 transition-opacity"
        >
          Openings
        </a>
        <a
          href="#shop"
          onClick={() => setMobileMenuOpen(false)}
          className="text-[32px] font-medium text-white hover:opacity-70 transition-opacity"
        >
          Shop
        </a>
        <a
          href="#contact"
          onClick={() => setMobileMenuOpen(false)}
          className="text-[32px] font-medium text-white underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          Get in touch
        </a>
      </div>

      {/* HERO SECTION (z-index: 1) */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10">
        <div className="max-w-xl">
          {/* 1. Blurred intro label */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6 text-[clamp(18px,4vw,26px)] leading-[1.3] font-normal text-white [filter:blur(4px)]"
          >
            Hey there, meet {characterMode === "mainframe" ? "A.R.I.A" : "Phra Dhammaduta"},
            <br />
            {characterMode === "mainframe"
              ? "Mainframe's Adaptive Response Interface Agent"
              : "Dhammaduta's Mindful 3D Cursor Tracking Agent"}
          </div>

          {/* 2. Typewriter text */}
          <p className="text-white mb-5 sm:mb-6 text-[clamp(18px,4vw,26px)] leading-[1.35] font-normal min-h-[54px]">
            {displayed}
            {!done && (
              <span
                className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink"
                aria-hidden="true"
              />
            )}
          </p>

          {/* 3. Action pill buttons */}
          <div
            className={`flex flex-wrap gap-y-1 transition-all duration-400 ease-out ${
              pillsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Pitch us an idea
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Come work here
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Send a brief hello
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              See how we operate
            </button>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer"
            >
              <span>
                Reach us: <span className="underline underline-offset-1">hello@mainframe.co</span>
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
                aria-hidden="true"
              >
                <rect x="4" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <rect x="1" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Character Mode Switcher (พระธรรมทูต 3D vs วิดีโอต้นฉบับ vs Mainframe Original) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-full border border-white/20 text-xs text-white">
        <span className="text-white/60 hidden sm:inline">โหมด 3D:</span>
        <button
          type="button"
          onClick={() => setCharacterMode("monk")}
          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
            characterMode === "monk"
              ? "bg-amber-500 text-black font-semibold shadow-md"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          🙏 พระธรรมทูต 3D
        </button>
        <button
          type="button"
          onClick={() => setCharacterMode("monk_video")}
          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
            characterMode === "monk_video"
              ? "bg-blue-500 text-white font-semibold shadow-md"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          🎬 วิดีโอต้นฉบับ
        </button>
        <button
          type="button"
          onClick={() => setCharacterMode("mainframe")}
          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
            characterMode === "mainframe"
              ? "bg-white text-black font-semibold shadow-md"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          🤖 Mainframe A.R.I.A
        </button>
      </div>
    </section>
  );
}

