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
  // Character mode: 3D Monk (custom) or Mainframe A.R.I.A (MotionSites original)
  const [characterMode, setCharacterMode] = useState<"monk" | "mainframe">("monk");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef<number>(1.0);
  const isSeekingRef = useRef<boolean>(false);
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Mouse & touch scrubbing + 3D perspective tilt controller
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      const windowW = window.innerWidth || 1;
      const windowH = window.innerHeight || 1;
      const normX = Math.max(0, Math.min(1, clientX / windowW));
      const normY = Math.max(0, Math.min(1, clientY / windowH));

      // 1. Calculate 3D perspective rotation (-12deg to +12deg on Y, -8deg to +8deg on X)
      const rotY = (normX - 0.5) * 24;
      const rotX = -(normY - 0.5) * 16;
      setTilt({ rotateX: rotX, rotateY: rotY });

      // 2. Video Scrubbing
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) return;

      targetTimeRef.current = normX * video.duration;

      if (!isSeekingRef.current && Math.abs(video.currentTime - targetTimeRef.current) > 0.02) {
        isSeekingRef.current = true;
        try {
          video.currentTime = targetTimeRef.current;
        } catch {
          isSeekingRef.current = false;
        }

        // Safety timeout to prevent seek deadlock if browser drops seeked event
        if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
        seekTimeoutRef.current = setTimeout(() => {
          isSeekingRef.current = false;
        }, 60);
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
    };
  }, []);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const centerTime = video.duration * 0.5;
    targetTimeRef.current = centerTime;
    try {
      video.currentTime = centerTime;
    } catch {
      // ignore
    }
  };

  const handleSeeked = () => {
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = null;
    }
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.03) {
      isSeekingRef.current = true;
      try {
        video.currentTime = targetTimeRef.current;
      } catch {
        isSeekingRef.current = false;
      }
    }
  };

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("hello@mainframe.co");
      toast.success("Copied hello@mainframe.co to clipboard!");
    }
  };

  const videoSrc =
    characterMode === "monk"
      ? "/videos/monk-3d-cursor.mp4"
      : "/videos/mainframe-cursor.mp4";

  return (
    <section className="relative w-full min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] overflow-hidden bg-[#051124] text-white font-[var(--font-body)] select-text flex flex-col justify-between">
      {/* 3D BACKGROUND VIDEO CONTAINER (perspective-tilted & mouse-scrubbed) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-75 ease-out"
        style={{
          transform: `perspective(1000px) rotateY(${tilt.rotateY}deg) rotateX(${tilt.rotateX}deg) scale(1.05)`,
          transformOrigin: "center 45%",
        }}
      >
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onSeeked={handleSeeked}
          className="absolute inset-0 w-full h-full object-cover object-[70%_center] z-0"
        />
      </div>

      {/* Dhammaduta ambient blue aura & vignette */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_72%_45%,rgba(5,86,202,0.32)_0%,rgba(4,14,29,0.1)_60%,transparent_80%)]" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#040e1d]/90 via-transparent to-[#040e1d]/50 pointer-events-none" />

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
            Hey there, meet {characterMode === "monk" ? "Phra Dhammaduta" : "A.R.I.A"},
            <br />
            {characterMode === "monk"
              ? "Dhammaduta's Mindful 3D Cursor Tracking Agent"
              : "Mainframe's Adaptive Response Interface Agent"}
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

      {/* 3D Character Mode Switcher (พระธรรมทูต 3D vs Mainframe Original) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-full border border-white/20 text-xs text-white">
        <span className="text-white/60 hidden sm:inline">3D Character:</span>
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
