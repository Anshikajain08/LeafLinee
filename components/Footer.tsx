"use client";
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Footer() {
  const footerRef = useRef(null);

  useGSAP(() => {
    // Reveal text elements when footer enters viewport
    gsap.from(".footer-content", {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 85%",
      },
    });
  }, { scope: footerRef });

  return (
    <footer 
      ref={footerRef} 
      className="bg-dark-green text-anti-flash-white font-axiforma border-t border-white/10"
    >
      <div className="footer-content max-w-7xl mx-auto py-20 px-10 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Section */}
        <div className="space-y-4">
          <h3 className="text-caribbean-green text-xl font-semibold uppercase tracking-widest">Connect</h3>
          <p className="text-zinc-400 max-w-xs">
            Let’s build something impactful using modern web technologies.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-mountain-meadow text-xl font-semibold uppercase tracking-widest">Links</h3>
          <div className="flex flex-col gap-2">
            <a href="https://github.com/MrPanda009" target="_blank" className="hover:text-caribbean-green transition-all">GitHub</a>
            <a href="https://www.linkedin.com/in/shrey-singh-70898237b/" target="_blank" className="hover:text-caribbean-green transition-all">LinkedIn</a>
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-4">
          <h3 className="text-mountain-meadow text-xl font-semibold uppercase tracking-widest">Location</h3>
          <p className="text-zinc-400">Delhi, India</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-caribbean-green animate-pulse"></span>
            <span className="text-sm">Available for new projects</span>
          </div>
        </div>
      </div>
      
      <div className="text-center py-6 border-t border-white/5 text-sm text-zinc-500">
        © 2026 Crafted with Next.js & GSAP
      </div>
    </footer>
  );
}